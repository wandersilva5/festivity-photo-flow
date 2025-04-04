
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Trash2 } from "lucide-react";
import { Photo } from '@/types/photo';
import { cn } from '@/lib/utils';

interface PhotoGridProps {
  photos: Photo[];
  mode: 'admin' | 'slideshow';
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  className?: string;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  mode,
  onApprove,
  onReject,
  className
}) => {
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
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  <Button 
                    onClick={() => onApprove?.(photo.id)} 
                    size="icon" 
                    variant="default"
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
  } else {
    // For slideshow mode, return a single card
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
            />
          </div>
        ))}
      </div>
    );
  }
};

export default PhotoGrid;
