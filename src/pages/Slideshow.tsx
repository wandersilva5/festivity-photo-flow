
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { usePhotoContext } from '@/context/PhotoContext';
import { Home, Settings, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const Slideshow = () => {
  const { photos, refreshPhotos, loading } = usePhotoContext();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Prevent right-click context menu
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // Set up automatic refresh of photos from server
  useEffect(() => {
    // Initial load
    refreshPhotos();
    
    // Refresh photos every 60 seconds
    const interval = setInterval(() => {
      refreshPhotos();
    }, 60000);
    
    setRefreshInterval(interval);
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    
    // Clear previous timeout
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    // Set new timeout to hide controls after 3 seconds
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    
    setControlsTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsTimeout]);

  // Advance to next photo every 5 seconds
  useEffect(() => {
    if (photos.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % photos.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [photos.length]);

  const handleManualRefresh = () => {
    refreshPhotos();
  };

  if (loading && photos.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-4">
        <div className="text-white">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Loading photos...</h2>
          <p className="text-white/70">
            Please wait while we fetch the latest photos
          </p>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-2xl font-bold mb-4">No photos available</h2>
        <p className="text-muted-foreground mb-8">
          There are no approved photos to display in the slideshow yet.
        </p>
        <div className="flex gap-4">
          <Button onClick={handleManualRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Link to="/">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black"
      onMouseMove={handleMouseMove}
    >
      {/* Controls */}
      <div 
        className={cn(
          "fixed top-0 left-0 right-0 p-4 flex justify-between items-center transition-opacity duration-300 bg-gradient-to-b from-black/50 to-transparent", 
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="text-white">
          <p className="text-sm font-medium">
            {currentPhotoIndex + 1} / {photos.length}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-white hover:bg-white/20"
            onClick={handleManualRefresh}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Link to="/admin">
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
              <Settings className="h-4 w-4 mr-1" />
              Admin
            </Button>
          </Link>
          <Link to="/">
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
              <Home className="h-4 w-4 mr-1" />
              Exit
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Slideshow */}
      <div className="w-full h-full">
        {photos.map((photo, index) => (
          <div 
            key={photo.id} 
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              index === currentPhotoIndex ? "opacity-100" : "opacity-0"
            )}
          >
            <img 
              src={photo.dataUrl} 
              alt={`Photo ${index + 1}`} 
              className="w-full h-full object-contain"
              onContextMenu={(e) => e.preventDefault()}
              style={{ 
                pointerEvents: 'none', 
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                WebkitTouchCallout: 'none'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Slideshow;
