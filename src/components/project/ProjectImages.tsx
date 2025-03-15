
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

  // Fetch images when component mounts
  useEffect(() => {
    fetchProjectImages();
  }, [projectId]);

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
        const imageUrls = await Promise.all(
          data.map(async (item) => {
            const { data: urlData } = await supabase
              .storage
              .from('project_images')
              .getPublicUrl(`${projectId}/${item.name}`);
            
            // Fetch summary if exists
            const { data: summaryData } = await supabase
              .from('image_summaries')
              .select('summary')
              .eq('image_url', urlData.publicUrl)
              .eq('project_id', projectId)
              .single();

            // Fetch tags if they exist
            const { data: tagsData } = await supabase
              .from('image_tags')
              .select('id, tag')
              .eq('image_url', urlData.publicUrl);

            return {
              url: urlData.publicUrl,
              path: `${projectId}/${item.name}`,
              size: item.metadata?.size || 0,
              name: item.name,
              createdAt: new Date(item.created_at || Date.now()),
              summary: summaryData?.summary || undefined,
              tags: tagsData || []
            };
          })
        );

        const sortedImages = imageUrls.sort((a, b) => 
          b.createdAt.getTime() - a.createdAt.getTime()
        );

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
      const { error } = await supabase
        .storage
        .from('project_images')
        .remove([imagePath]);

      if (error) throw error;

      // Update the local state
      setUploadedImages(prevImages => prevImages.filter(img => img.path !== imagePath));
      
      // Update the parent component's state
      const updatedImages = uploadedImages.filter(img => img.path !== imagePath);
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
