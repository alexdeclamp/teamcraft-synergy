
import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Image as ImageIcon, 
  Upload, 
  Loader2,
  X,
  FolderCheck,
  FileWarning,
  Trash2,
  Ban,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import ImageSummaryButton from './ImageSummaryButton';

interface ProjectImageUploadProps {
  projectId: string;
  onUploadComplete?: (imageUrl: string, imagePath: string) => void;
  maxWidth?: number;
  maxHeight?: number;
  maxSizeInMB?: number;
}

interface UploadedImage {
  url: string;
  path: string;
  size: number;
  name: string;
  createdAt: Date;
}

const ProjectImageUpload: React.FC<ProjectImageUploadProps> = ({
  projectId,
  onUploadComplete,
  maxWidth = 1200,
  maxHeight = 1200,
  maxSizeInMB = 2,
}) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  const fetchUploadedImages = useCallback(async () => {
    if (!projectId || !user) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .storage
        .from('project_images')
        .list(`${projectId}`);

      if (error) throw error;

      if (data) {
        const imageUrls = await Promise.all(
          data.map(async (item) => {
            const { data: urlData } = await supabase
              .storage
              .from('project_images')
              .getPublicUrl(`${projectId}/${item.name}`);

            return {
              url: urlData.publicUrl,
              path: `${projectId}/${item.name}`,
              size: item.metadata?.size || 0,
              name: item.name,
              createdAt: new Date(item.created_at || Date.now()),
            };
          })
        );

        setUploadedImages(imageUrls);
      }
    } catch (error: any) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load uploaded images');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, user]);

  // Fetch images when component mounts and after uploads
  useEffect(() => {
    fetchUploadedImages();
  }, [fetchUploadedImages]);

  const resetUpload = () => {
    setSelectedFile(null);
    setPreview(null);
    setUploadProgress(0);
  };

  const handleCloseDialog = () => {
    resetUpload();
    setIsDialogOpen(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > maxSizeInBytes) {
      toast.error(`File size exceeds ${maxSizeInMB} MB limit`);
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const compressImage = (file: File, maxWidth: number, maxHeight: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image(); // Use window.Image instead of Image to avoid confusion with the lucide icon
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Scale down maintaining aspect ratio
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to JPEG with 0.8 quality
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              resolve(blob);
            },
            'image/jpeg',
            0.8
          );
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image for compression'));
        };
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
    });
  };

  const handleUpload = async () => {
    if (!selectedFile || !projectId || !user) return;
    
    try {
      setIsUploading(true);
      setUploadProgress(10);
      
      // Compress the image
      const compressedImage = await compressImage(selectedFile, maxWidth, maxHeight);
      setUploadProgress(40);

      const fileName = `${Date.now()}-${selectedFile.name.replace(/\s+/g, '_')}`;
      const filePath = `${projectId}/${fileName}`;
      
      const { data, error } = await supabase
        .storage
        .from('project_images')
        .upload(filePath, compressedImage, {
          cacheControl: '3600',
          upsert: false,
        });
      
      setUploadProgress(90);

      if (error) throw error;

      const { data: urlData } = await supabase
        .storage
        .from('project_images')
        .getPublicUrl(filePath);

      setUploadProgress(100);
      
      if (onUploadComplete) {
        onUploadComplete(urlData.publicUrl, filePath);
      }
      
      toast.success('Image uploaded successfully');
      
      // Fetch updated images list
      await fetchUploadedImages();
      
      // Close the dialog
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imagePath: string) => {
    if (!user) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this image?');
    if (!confirmed) return;
    
    try {
      const { error } = await supabase
        .storage
        .from('project_images')
        .remove([imagePath]);
        
      if (error) throw error;
      
      setUploadedImages(uploadedImages.filter(img => img.path !== imagePath));
      toast.success('Image deleted successfully');
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Image
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Upload Project Image</DialogTitle>
              <DialogDescription>
                Upload an image for your project. The image will be compressed to save space.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {!selectedFile ? (
                <div 
                  className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:bg-accent/10 transition-colors"
                  onClick={() => document.getElementById('image-input')?.click()}
                >
                  <ImageIcon className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to select an image or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Maximum size: {maxSizeInMB} MB
                  </p>
                  <input
                    id="image-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img 
                      src={preview || ''} 
                      alt="Preview" 
                      className="rounded-lg w-full object-cover max-h-[300px]" 
                    />
                    <Button 
                      variant="destructive" 
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 opacity-80 hover:opacity-100"
                      onClick={resetUpload}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="text-sm">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-muted-foreground text-xs">
                      Size: {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
              )}
              
              {isUploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-center text-muted-foreground">
                    {uploadProgress === 100 ? 'Complete!' : 'Uploading...'}
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog} disabled={isUploading}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={!selectedFile || isUploading}
              >
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isGalleryDialogOpen} onOpenChange={setIsGalleryDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <FolderCheck className="h-4 w-4" />
              Project Images
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Project Images</DialogTitle>
              <DialogDescription>
                Browse and manage images for this project.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : uploadedImages.length === 0 ? (
                <div className="text-center py-10 bg-muted/50 rounded-lg">
                  <FileWarning className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No images have been uploaded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {uploadedImages.map((image) => (
                    <Card key={image.path} className="overflow-hidden">
                      <div className="relative h-40">
                        <img 
                          src={image.url} 
                          alt={image.name} 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute top-2 right-2 flex space-x-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="destructive" 
                                  size="icon"
                                  className="h-7 w-7 opacity-80 hover:opacity-100"
                                  onClick={() => handleDeleteImage(image.path)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="truncate">
                            <p className="font-medium text-sm truncate" title={image.name}>
                              {image.name}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {formatFileSize(image.size)}
                            </p>
                          </div>
                          <div className="flex space-x-1">
                            <ImageSummaryButton 
                              imageUrl={image.url}
                              imageName={image.name}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 flex-shrink-0"
                              onClick={() => {
                                navigator.clipboard.writeText(image.url);
                                toast.success('Image URL copied to clipboard');
                              }}
                            >
                              <Info className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <Input
                          value={image.url}
                          readOnly
                          onClick={(e) => e.currentTarget.select()}
                          className="mt-2 text-xs"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Display uploaded images directly in the component */}
      <div>
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : uploadedImages.length === 0 ? (
          <div className="text-center py-10 bg-muted/50 rounded-lg">
            <FileWarning className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">No images have been uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image) => (
              <Card key={image.path} className="overflow-hidden">
                <div className="relative h-40">
                  <img 
                    src={image.url} 
                    alt={image.name} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="destructive" 
                            size="icon"
                            className="h-7 w-7 opacity-80 hover:opacity-100"
                            onClick={() => handleDeleteImage(image.path)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="truncate">
                      <p className="font-medium text-sm truncate" title={image.name}>
                        {image.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatFileSize(image.size)}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <ImageSummaryButton 
                        imageUrl={image.url}
                        imageName={image.name}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 flex-shrink-0"
                        onClick={() => {
                          navigator.clipboard.writeText(image.url);
                          toast.success('Image URL copied to clipboard');
                        }}
                      >
                        <Info className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <Input
                    value={image.url}
                    readOnly
                    onClick={(e) => e.currentTarget.select()}
                    className="mt-2 text-xs"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectImageUpload;
