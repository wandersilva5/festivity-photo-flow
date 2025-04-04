
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { toast } from "sonner";
import { Photo } from '@/types/photo';
import { v4 as uuidv4 } from 'uuid';

interface PhotoContextProps {
  photos: Photo[];
  pendingPhotos: Photo[];
  addPhoto: (dataUrl: string) => void;
  approvePhoto: (id: string) => void;
  rejectPhoto: (id: string) => void;
  clearAllPhotos: () => void;
}

const PhotoContext = createContext<PhotoContextProps | undefined>(undefined);

interface PhotoProviderProps {
  children: ReactNode;
}

export const PhotoProvider = ({ children }: PhotoProviderProps) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState<Photo[]>([]);

  // Initialize from localStorage on first load
  useEffect(() => {
    try {
      const savedPhotos = localStorage.getItem('festivityApprovedPhotos');
      const savedPending = localStorage.getItem('festivityPendingPhotos');
      
      if (savedPhotos) {
        setPhotos(JSON.parse(savedPhotos));
      }
      
      if (savedPending) {
        setPendingPhotos(JSON.parse(savedPending));
      }
    } catch (error) {
      console.error('Error loading photos from localStorage', error);
      toast.error('Failed to load saved photos');
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('festivityApprovedPhotos', JSON.stringify(photos));
  }, [photos]);

  useEffect(() => {
    localStorage.setItem('festivityPendingPhotos', JSON.stringify(pendingPhotos));
  }, [pendingPhotos]);

  const addPhoto = (dataUrl: string) => {
    const newPhoto: Photo = {
      id: uuidv4(),
      dataUrl,
      timestamp: new Date().toISOString(),
      approved: false
    };

    setPendingPhotos((prevPending) => [...prevPending, newPhoto]);
    toast.success('Photo submitted for approval!');
  };

  const approvePhoto = (id: string) => {
    const photoToApprove = pendingPhotos.find(photo => photo.id === id);
    
    if (photoToApprove) {
      const approvedPhoto = { ...photoToApprove, approved: true };
      
      setPhotos((prevPhotos) => [...prevPhotos, approvedPhoto]);
      setPendingPhotos((prevPending) => prevPending.filter(photo => photo.id !== id));
      
      toast.success('Photo approved!');
    }
  };

  const rejectPhoto = (id: string) => {
    setPendingPhotos((prevPending) => prevPending.filter(photo => photo.id !== id));
    toast.info('Photo rejected');
  };

  const clearAllPhotos = () => {
    setPhotos([]);
    setPendingPhotos([]);
    localStorage.removeItem('festivityApprovedPhotos');
    localStorage.removeItem('festivityPendingPhotos');
    toast.info('All photos cleared');
  };

  const value = {
    photos,
    pendingPhotos,
    addPhoto,
    approvePhoto,
    rejectPhoto,
    clearAllPhotos
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
