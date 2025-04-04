
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PhotoGrid from '@/components/PhotoGrid';
import { usePhotoContext } from '@/context/PhotoContext';
import { useAuth } from '@/context/AuthContext';
import { Home, Trash2, LogOut, FolderOpen } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Admin = () => {
  const { pendingPhotos, photos, approvePhoto, rejectPhoto, deletePhoto, clearAllPhotos } = usePhotoContext();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Review and manage photos
            </p>
          </div>

          <div className="flex space-x-2 mt-4 sm:mt-0">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All Photos
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will delete all photos, both pending and approved. 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearAllPhotos}>
                    Delete All Photos
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button variant="outline" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>

            <Link to="/">
              <Button variant="outline">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="pending" className="flex items-center">
              <FolderOpen className="mr-2 h-4 w-4" />
              Pending Approval ({pendingPhotos.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center">
              <FolderOpen className="mr-2 h-4 w-4" />
              Approved Photos ({photos.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Photos Pending Review</CardTitle>
                <CardDescription>
                  Approve or reject photos submitted by guests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PhotoGrid 
                  photos={pendingPhotos} 
                  mode="admin" 
                  onApprove={approvePhoto}
                  onReject={rejectPhoto}
                  onDelete={(id) => deletePhoto(id, false)}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>Approved Photos</CardTitle>
                <CardDescription>
                  Photos that will appear in the slideshow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Link to="/slideshow">
                    <Button>Launch Slideshow</Button>
                  </Link>
                </div>
                <PhotoGrid 
                  photos={photos}
                  mode="approved" 
                  onDelete={(id) => deletePhoto(id, true)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
