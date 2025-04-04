
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { Camera, Shield, Presentation } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent festive-gradient pb-2">
            Festivity Photo Flow
          </h1>
          <p className="text-xl text-muted-foreground mt-4">
            Share moments from your celebration with everyone
          </p>
        </div>

        {/* Main content */}
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <div className="flex flex-col items-center space-y-6">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Join the Fun!</CardTitle>
                <CardDescription>Scan this QR code with your phone to add your photos</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <QRCodeDisplay value="/capture" />
              </CardContent>
            </Card>
            
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                All photos will be reviewed before being added to the slideshow
              </p>
            </div>
          </div>

          <div className="flex flex-col space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Controls</CardTitle>
                <CardDescription>Manage photos and slideshow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <Link to="/admin">
                    <Button className="w-full" size="lg">
                      <Shield className="mr-2 h-5 w-5" />
                      Admin Dashboard
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Review and approve submitted photos
                  </p>
                </div>

                <div className="flex flex-col space-y-2">
                  <Link to="/slideshow">
                    <Button className="w-full" variant="outline" size="lg">
                      <Presentation className="mr-2 h-5 w-5" />
                      Launch Slideshow
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Display all approved photos in a fullscreen slideshow
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Direct Access</CardTitle>
                <CardDescription>Access the photo capture interface directly</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/capture">
                  <Button className="w-full bg-secondary hover:bg-secondary/90" size="lg">
                    <Camera className="mr-2 h-5 w-5" />
                    Take Photos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
