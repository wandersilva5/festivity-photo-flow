
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import PhotoCapture from '@/components/PhotoCapture';
import { Home } from 'lucide-react';

const Capture = () => {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent festive-gradient pb-1">
            Take a Photo
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Capture a moment to share with everyone
          </p>
        </div>

        <div className="my-6">
          <PhotoCapture />
        </div>

        <div className="mt-8 text-center">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Capture;
