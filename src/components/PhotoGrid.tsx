
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Trash2, Loader2 } from "lucide-react";
import { Photo } from '@/types/photo';
import { cn } from '@/lib/utils';

interface PhotoGridProps {
  photos: Photo[];
  mode: 'admin' | 'slideshow' | 'approved';
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  className?: string;
  loading?: boolean;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  mode,
  onApprove,
  onReject,
  onDelete,
  className,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-muted-foreground">
          Loading photos...
        </p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] p-8 text-center">
        <p className="text-muted-foreground">
          {mode === 'admin' ? 'No pending photos to review' : 'No approved photos yet'}
        </p>
      </div>
    );
  }

  if (mode === 'admin') {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
        {photos.map((photo) => (
          <Card key={photo.id} className="overflow-hidden border border-border hover:border-primary/50 transition-all">
            <CardContent className="p-0">
              <div className="relative">
                <img 
                  src={photo.dataUrl} 
                  alt="Captured photo" 
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 flex justify-between p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <Button 
                    onClick={() => onReject?.(photo.id)} 
                    size="icon" 
                    variant="destructive"
                    disabled={loading}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  <Button 
                    onClick={() => onDelete?.(photo.id)} 
                    size="icon" 
                    variant="secondary"
                    disabled={loading}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                  <Button 
                    onClick={() => onApprove?.(photo.id)} 
                    size="icon" 
                    variant="default"
                    disabled={loading}
                  >
                    <Check className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  } else if (mode === 'approved') {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", className)}>
        {photos.map((photo) => (
          <div key={photo.id} className="relative aspect-[4/3] rounded-md overflow-hidden group">
            <img 
              src={photo.dataUrl} 
              alt="Approved photo" 
              className="w-full h-full object-cover"
            />
            {onDelete && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button 
                  onClick={() => onDelete(photo.id)} 
                  size="icon" 
                  variant="destructive"
                  disabled={loading}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  } else {
    // For slideshow mode
    return (
      <div className={cn("w-full h-full", className)}>
        {photos.map((photo, index) => (
          <div 
            key={photo.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === 0 ? 'opacity-100' : 'opacity-0'}`}
          >
            <img 
              src={photo.dataUrl} 
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-contain"
              onContextMenu={(e) => e.preventDefault()}
              style={{ 
                pointerEvents: 'none', 
                userSelect: 'none' 
              }}
            />
          </div>
        ))}
      </div>
    );
  }
};

export default PhotoGrid;
