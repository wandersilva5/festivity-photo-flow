
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { toast } from "sonner";
import { Photo } from '@/types/photo';
import { photoService } from '@/services/photoService';

interface PhotoContextProps {
  photos: Photo[];
  pendingPhotos: Photo[];
  addPhoto: (dataUrl: string) => Promise<void>;
  approvePhoto: (id: string) => Promise<void>;
  rejectPhoto: (id: string) => Promise<void>;
  deletePhoto: (id: string, isApproved: boolean) => Promise<void>;
  clearAllPhotos: () => Promise<void>;
  refreshPhotos: () => Promise<void>;
  loading: boolean;
}

const PhotoContext = createContext<PhotoContextProps | undefined>(undefined);

interface PhotoProviderProps {
  children: ReactNode;
}

export const PhotoProvider = ({ children }: PhotoProviderProps) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);

  // Function to refresh photos from the server
  const refreshPhotos = async () => {
    setLoading(true);
    try {
      const [approvedPhotos, pendingPhotosList] = await Promise.all([
        photoService.fetchApprovedPhotos(),
        photoService.fetchPendingPhotos()
      ]);
      
      setPhotos(approvedPhotos);
      setPendingPhotos(pendingPhotosList);
    } catch (error) {
      console.error('Error refreshing photos:', error);
      toast.error('Failed to load photos from the server');
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on load
  useEffect(() => {
    refreshPhotos();
    
    // Set up polling to check for new photos every 30 seconds
    const interval = setInterval(refreshPhotos, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const addPhoto = async (dataUrl: string) => {
    try {
      setLoading(true);
      const result = await photoService.uploadPhoto(dataUrl);
      
      if (result) {
        // Refresh the pending photos list
        const pendingPhotosList = await photoService.fetchPendingPhotos();
        setPendingPhotos(pendingPhotosList);
        toast.success('Photo submitted for approval!');
      } else {
        toast.error('Failed to upload photo');
      }
    } catch (error) {
      console.error('Error in addPhoto:', error);
      toast.error('Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  const approvePhoto = async (id: string) => {
    try {
      setLoading(true);
      const success = await photoService.approvePhoto(id);
      
      if (success) {
        // Refresh both lists
        const approvedPhotos = await photoService.fetchApprovedPhotos();
        const pendingPhotosList = await photoService.fetchPendingPhotos();
        
        setPhotos(approvedPhotos);
        setPendingPhotos(pendingPhotosList);
        toast.success('Photo approved!');
      } else {
        toast.error('Failed to approve photo');
      }
    } catch (error) {
      console.error('Error in approvePhoto:', error);
      toast.error('Failed to approve photo');
    } finally {
      setLoading(false);
    }
  };

  const rejectPhoto = async (id: string) => {
    try {
      setLoading(true);
      const success = await photoService.rejectPhoto(id);
      
      if (success) {
        // Just refresh pending photos
        const pendingPhotosList = await photoService.fetchPendingPhotos();
        setPendingPhotos(pendingPhotosList);
        toast.info('Photo rejected');
      } else {
        toast.error('Failed to reject photo');
      }
    } catch (error) {
      console.error('Error in rejectPhoto:', error);
      toast.error('Failed to reject photo');
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = async (id: string, isApproved: boolean) => {
    try {
      setLoading(true);
      const success = await photoService.deletePhoto(id, isApproved);
      
      if (success) {
        if (isApproved) {
          // Refresh approved photos
          const approvedPhotos = await photoService.fetchApprovedPhotos();
          setPhotos(approvedPhotos);
          toast.info('Approved photo deleted');
        } else {
          // Refresh pending photos
          const pendingPhotosList = await photoService.fetchPendingPhotos();
          setPendingPhotos(pendingPhotosList);
          toast.info('Pending photo deleted');
        }
      } else {
        toast.error('Failed to delete photo');
      }
    } catch (error) {
      console.error('Error in deletePhoto:', error);
      toast.error('Failed to delete photo');
    } finally {
      setLoading(false);
    }
  };

  const clearAllPhotos = async () => {
    try {
      setLoading(true);
      const success = await photoService.clearAllPhotos();
      
      if (success) {
        setPhotos([]);
        setPendingPhotos([]);
        toast.info('All photos cleared');
      } else {
        toast.error('Failed to clear photos');
      }
    } catch (error) {
      console.error('Error in clearAllPhotos:', error);
      toast.error('Failed to clear photos');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    photos,
    pendingPhotos,
    addPhoto,
    approvePhoto,
    rejectPhoto,
    deletePhoto,
    clearAllPhotos,
    refreshPhotos,
    loading
  };

  return <PhotoContext.Provider value={value}>{children}</PhotoContext.Provider>;
};

export const usePhotoContext = (): PhotoContextProps => {
  const context = useContext(PhotoContext);
  
  if (context === undefined) {
    throw new Error('usePhotoContext must be used within a PhotoProvider');
  }
  
  return context;
};
