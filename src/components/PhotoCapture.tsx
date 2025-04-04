
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, RotateCcw, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePhotoContext } from '@/context/PhotoContext';

const PhotoCapture: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { addPhoto } = usePhotoContext();

  useEffect(() => {
    initCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 } 
        } 
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Access Error",
        description: "Please allow camera access to take photos",
        variant: "destructive"
      });
    }
  };

  const takePhoto = () => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(dataUrl);
      
      // Stop the camera stream when photo is taken
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setIsCameraReady(false);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    initCamera();
  };

  const submitPhoto = async () => {
    if (capturedImage) {
      setIsSubmitting(true);
      try {
        await addPhoto(capturedImage);
        setCapturedImage(null);
        
        // Delay restarting camera slightly for better UX
        setTimeout(initCamera, 1000);
      } catch (error) {
        console.error('Error submitting photo:', error);
        toast({
          title: "Error",
          description: "Failed to submit photo. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-full max-w-md aspect-[4/3] bg-black rounded-lg overflow-hidden">
        {!capturedImage ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
        ) : (
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="w-full h-full object-cover" 
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex gap-4 justify-center w-full">
        {!capturedImage ? (
          <Button
            disabled={!isCameraReady}
            className="w-full"
            size="lg"
            onClick={takePhoto}
          >
            <Camera className="mr-2 h-5 w-5" />
            Take Photo
          </Button>
        ) : (
          <>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={retakePhoto}
              disabled={isSubmitting}
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Retake
            </Button>
            <Button 
              className="flex-1 bg-secondary hover:bg-secondary/90"
              onClick={submitPhoto}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Upload className="mr-2 h-5 w-5" />
              )}
              {isSubmitting ? "Sending..." : "Send"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default PhotoCapture;
