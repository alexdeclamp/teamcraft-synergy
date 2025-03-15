
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import ProjectImageUpload from '@/components/ProjectImageUpload';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import GalleryDialog from '@/components/image-upload/GalleryDialog';

interface UploadedImage {
  url: string;
  path: string;
  size: number;
  name: string;
  createdAt: Date;
  summary?: string;
  tags?: Array<{ id: string; tag: string }>;
}

interface ProjectImagesProps {
  projectId: string;
  onImagesUpdated: (images: UploadedImage[], recentImages: UploadedImage[]) => void;
}

const ProjectImages: React.FC<ProjectImagesProps> = ({ projectId, onImagesUpdated }) => {
  const { user } = useAuth();
  const [isImagesLoading, setIsImagesLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [deletedImagePaths, setDeletedImagePaths] = useState<string[]>([]);
  
  // Use localStorage to persist deleted image paths across sessions
  useEffect(() => {
    // Load deleted image paths from localStorage on component mount
    const storedDeletedPaths = localStorage.getItem(`deletedImages-${projectId}`);
    if (storedDeletedPaths) {
      setDeletedImagePaths(JSON.parse(storedDeletedPaths));
    }
  }, [projectId]);

  // Fetch images when component mounts or after deletion
  useEffect(() => {
    fetchProjectImages();
  }, [projectId, deletedImagePaths]);

  const fetchProjectImages = async () => {
    if (!projectId || !user) return;

    try {
      setIsImagesLoading(true);
      
      const { data, error } = await supabase
        .storage
        .from('project_images')
        .list(`${projectId}`);

      if (error) throw error;

      if (data) {
        console.log('Fetched images:', data);
        console.log('Currently deleted paths:', deletedImagePaths);
        
        const imagePromises = data.map(async (item) => {
          const imagePath = `${projectId}/${item.name}`;
          
          // Skip images that have been deleted
          if (deletedImagePaths.includes(imagePath)) {
            console.log('Skipping deleted image:', imagePath);
            return null;
          }
          
          const { data: urlData } = await supabase
            .storage
            .from('project_images')
            .getPublicUrl(imagePath);
          
          // Fetch summary if exists
          const { data: summaryData } = await supabase
            .from('image_summaries')
            .select('summary')
            .eq('image_url', urlData.publicUrl)
            .eq('project_id', projectId)
            .maybeSingle();

          // Fetch tags if they exist
          const { data: tagsData } = await supabase
            .from('image_tags')
            .select('id, tag')
            .eq('image_url', urlData.publicUrl);

          return {
            url: urlData.publicUrl,
            path: imagePath,
            size: item.metadata?.size || 0,
            name: item.name,
            createdAt: new Date(item.created_at || Date.now()),
            summary: summaryData?.summary || undefined,
            tags: tagsData || []
          };
        });
        
        const imageResults = await Promise.all(imagePromises);
        const filteredImages = imageResults.filter(img => img !== null) as UploadedImage[];
        
        const sortedImages = filteredImages.sort((a, b) => 
          b.createdAt.getTime() - a.createdAt.getTime()
        );

        console.log('Processed images after filtering deleted:', sortedImages.length);
        setUploadedImages(sortedImages);
        onImagesUpdated(sortedImages, sortedImages.slice(0, 3));
      }
    } catch (error: any) {
      console.error('Error fetching images:', error);
    } finally {
      setIsImagesLoading(false);
    }
  };

  const handleImageUploadComplete = async (imageUrl: string) => {
    // Refresh the project images
    await fetchProjectImages();
    toast.success('Image uploaded successfully');
  };

  const handleDeleteImage = async (imagePath: string) => {
    try {
      // Find the image in our current state
      const imageToDelete = uploadedImages.find(img => img.path === imagePath);
      
      if (!imageToDelete) {
        toast.error('Image not found');
        return;
      }
      
      // Delete from storage
      const { error } = await supabase
        .storage
        .from('project_images')
        .remove([imagePath]);

      if (error) throw error;
      
      // Delete any related tags
      const { error: tagError } = await supabase
        .from('image_tags')
        .delete()
        .eq('image_url', imageToDelete.url);
        
      if (tagError) {
        console.error('Error deleting image tags:', tagError);
      }
      
      // Delete any related summaries
      const { error: summaryError } = await supabase
        .from('image_summaries')
        .delete()
        .eq('image_url', imageToDelete.url);
        
      if (summaryError) {
        console.error('Error deleting image summary:', summaryError);
      }

      // Add to deleted paths and persist to localStorage
      const updatedDeletedPaths = [...deletedImagePaths, imagePath];
      setDeletedImagePaths(updatedDeletedPaths);
      localStorage.setItem(`deletedImages-${projectId}`, JSON.stringify(updatedDeletedPaths));
      
      console.log('Image deleted:', imagePath);
      console.log('Updated deleted paths:', updatedDeletedPaths);
      
      // Update our local state
      const updatedImages = uploadedImages.filter(img => img.path !== imagePath);
      
      // Update both our local state and parent component state
      setUploadedImages(updatedImages);
      onImagesUpdated(updatedImages, updatedImages.slice(0, 3));
      
      toast.success('Image deleted successfully');
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  return (
    <>
      <ProjectImageUpload 
        projectId={projectId} 
        onUploadComplete={handleImageUploadComplete}
        deletedImagePaths={deletedImagePaths}
      />
      
      <GalleryDialog
        isOpen={isGalleryOpen}
        onOpenChange={setIsGalleryOpen}
        uploadedImages={uploadedImages}
        isLoading={isImagesLoading}
        onDeleteImage={handleDeleteImage}
        projectId={projectId}
        onImageRenamed={fetchProjectImages}
      />
    </>
  );
};

export default ProjectImages;
