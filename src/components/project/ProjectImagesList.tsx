import React, { useState } from 'react';
import { 
  Card, 
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ImageSummaryButton from '@/components/ImageSummaryButton';
import { Trash2, Download, ExternalLink } from 'lucide-react';
import { formatFileSize } from '@/utils/projectUtils';
import ToggleStatusButton from './common/ToggleStatusButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UploadedImage {
  url: string;
  path: string;
  size: number;
  name: string;
  createdAt: Date;
  summary?: string;
  is_favorite?: boolean;
  is_important?: boolean;
  is_archived?: boolean;
}

interface ProjectImagesListProps {
  projectId: string;
  images: UploadedImage[];
  onImagesUpdated: (images: UploadedImage[]) => void;
  isLoading?: boolean;
}

const ProjectImagesList: React.FC<ProjectImagesListProps> = ({
  projectId,
  images,
  onImagesUpdated,
  isLoading = false
}) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const handleSelectImage = (imagePath: string) => {
    setSelectedImages(prev => {
      if (prev.includes(imagePath)) {
        return prev.filter(path => path !== imagePath);
      } else {
        return [...prev, imagePath];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedImages.length === filteredImages.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(filteredImages.map(img => img.path));
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedImages.length) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedImages.length} image(s)?`)) {
      return;
    }

    try {
      setIsUpdating(true);
      
      for (const path of selectedImages) {
        const { error: storageError } = await supabase
          .storage
          .from('project_images')
          .remove([path]);
          
        if (storageError) throw storageError;
        
        const imageToDelete = images.find(img => img.path === path);
        if (imageToDelete) {
          const { error: metadataError } = await supabase
            .from('image_summaries')
            .delete()
            .eq('image_url', imageToDelete.url)
            .eq('project_id', projectId);
            
          if (metadataError) console.error('Error deleting image metadata:', metadataError);
        }
      }
      
      const updatedImages = images.filter(img => !selectedImages.includes(img.path));
      onImagesUpdated(updatedImages);
      setSelectedImages([]);
      
      toast.success(`${selectedImages.length} image(s) deleted successfully`);
    } catch (error: any) {
      console.error('Error deleting images:', error);
      toast.error('Failed to delete images');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenImage = (image: UploadedImage) => {
    setSelectedImage(image);
  };

  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  const handleDownload = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  const toggleImageFavorite = async (image: UploadedImage) => {
    try {
      setIsUpdating(true);
      
      if (image.summary) {
        const { error } = await supabase
          .from('image_summaries')
          .update({ 
            is_favorite: !image.is_favorite,
            updated_at: new Date().toISOString()
          })
          .eq('image_url', image.url)
          .eq('project_id', projectId);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('image_summaries')
          .insert({
            image_url: image.url,
            project_id: projectId,
            summary: '',
            is_favorite: !image.is_favorite,
            is_important: image.is_important || false,
            is_archived: image.is_archived || false,
            user_id: (await supabase.auth.getUser()).data.user?.id || ''
          });
          
        if (error) throw error;
      }
      
      const updatedImages = images.map(img => {
        if (img.url === image.url) {
          return { ...img, is_favorite: !image.is_favorite };
        }
        return img;
      });
      
      onImagesUpdated(updatedImages);
      
      toast.success(
        !image.is_favorite
          ? 'Image added to favorites'
          : 'Image removed from favorites'
      );
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update image');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const toggleImageArchive = async (image: UploadedImage) => {
    try {
      setIsUpdating(true);
      
      if (image.summary) {
        const { error } = await supabase
          .from('image_summaries')
          .update({ 
            is_archived: !image.is_archived,
            updated_at: new Date().toISOString()
          })
          .eq('image_url', image.url)
          .eq('project_id', projectId);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('image_summaries')
          .insert({
            image_url: image.url,
            project_id: projectId,
            summary: '',
            is_favorite: image.is_favorite || false,
            is_important: image.is_important || false,
            is_archived: !image.is_archived,
            user_id: (await supabase.auth.getUser()).data.user?.id || ''
          });
          
        if (error) throw error;
      }
      
      const updatedImages = images.map(img => {
        if (img.url === image.url) {
          return { ...img, is_archived: !image.is_archived };
        }
        return img;
      });
      
      onImagesUpdated(updatedImages);
      
      toast.success(
        !image.is_archived
          ? 'Image archived'
          : 'Image restored from archive'
      );
    } catch (error: any) {
      console.error('Error toggling archive:', error);
      toast.error('Failed to update image');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const toggleImageImportant = async (image: UploadedImage) => {
    try {
      setIsUpdating(true);
      
      if (image.summary) {
        const { error } = await supabase
          .from('image_summaries')
          .update({ 
            is_important: !image.is_important,
            updated_at: new Date().toISOString()
          })
          .eq('image_url', image.url)
          .eq('project_id', projectId);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('image_summaries')
          .insert({
            image_url: image.url,
            project_id: projectId,
            summary: '',
            is_favorite: image.is_favorite || false,
            is_important: !image.is_important,
            is_archived: image.is_archived || false,
            user_id: (await supabase.auth.getUser()).data.user?.id || ''
          });
          
        if (error) throw error;
      }
      
      const updatedImages = images.map(img => {
        if (img.url === image.url) {
          return { ...img, is_important: !image.is_important };
        }
        return img;
      });
      
      onImagesUpdated(updatedImages);
      
      toast.success(
        !image.is_important
          ? 'Image marked as important'
          : 'Image unmarked as important'
      );
    } catch (error: any) {
      console.error('Error toggling important:', error);
      toast.error('Failed to update image');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredImages = images.filter(img => {
    switch (activeTab) {
      case 'favorites':
        return img.is_favorite;
      case 'important':
        return img.is_important;
      case 'archived':
        return img.is_archived;
      default:
        return !img.is_archived;
    }
  });

  if (isLoading) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        Loading images...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="important">Important</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {filteredImages.length > 0 && (
        <div className="flex justify-between mb-2">
          <div className="flex items-center">
            <Checkbox 
              id="select-all" 
              checked={selectedImages.length === filteredImages.length && filteredImages.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="ml-2 text-sm">
              Select All
            </label>
          </div>
          {selectedImages.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDeleteSelected}
              disabled={isUpdating}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Selected ({selectedImages.length})
            </Button>
          )}
        </div>
      )}
      
      {filteredImages.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          {activeTab === 'all' 
            ? 'No images found in this project.' 
            : `No ${activeTab} images found.`}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredImages.map((image) => (
            <Card 
              key={image.path} 
              className={`overflow-hidden ${image.is_archived ? 'opacity-60' : 'opacity-100'}`}
            >
              <div className="relative">
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox 
                    checked={selectedImages.includes(image.path)}
                    onCheckedChange={() => handleSelectImage(image.path)}
                    className="bg-white/90 border-gray-400"
                  />
                </div>
                <div className="absolute top-2 right-2 z-10 flex space-x-1">
                  <ToggleStatusButton 
                    status="important"
                    isActive={!!image.is_important}
                    onClick={() => toggleImageImportant(image)}
                    size="sm"
                    className="bg-white/90"
                    disabled={isUpdating}
                  />
                  <ToggleStatusButton 
                    status="favorite"
                    isActive={!!image.is_favorite}
                    onClick={() => toggleImageFavorite(image)}
                    size="sm"
                    className="bg-white/90"
                    disabled={isUpdating}
                  />
                  <ToggleStatusButton 
                    status="archive"
                    isActive={!!image.is_archived}
                    onClick={() => toggleImageArchive(image)}
                    size="sm"
                    className="bg-white/90"
                    disabled={isUpdating}
                  />
                </div>
                <div 
                  className="w-full aspect-video bg-center bg-cover cursor-pointer"
                  style={{ backgroundImage: `url(${image.url})` }}
                  onClick={() => handleOpenImage(image)}
                ></div>
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">{image.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(image.size)} • {image.createdAt.toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter className="p-3 pt-0 flex justify-between">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDownload(image.url, image.name)}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleOpenInNewTab(image.url)}
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <ImageSummaryButton 
                  imageUrl={image.url}
                  projectId={projectId}
                  imageName={image.name}
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && handleCloseImage()}>
        {selectedImage && (
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedImage.name}</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center">
              <img 
                src={selectedImage.url} 
                alt={selectedImage.name} 
                className="max-h-[70vh] max-w-full object-contain" 
              />
            </div>
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedImage.size)} • {selectedImage.createdAt.toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(selectedImage.url, selectedImage.name)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenInNewTab(selectedImage.url)}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default ProjectImagesList;
