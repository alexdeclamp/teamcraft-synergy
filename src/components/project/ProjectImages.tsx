
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

interface UploadedImage {
  url: string;
  path: string;
  size: number;
  name: string;
  createdAt: Date;
  summary?: string;
}

interface ProjectImagesProps {
  projectId: string;
  onImagesUpdated: (images: UploadedImage[], recentImages: UploadedImage[]) => void;
}

const ProjectImages: React.FC<ProjectImagesProps> = ({ projectId, onImagesUpdated }) => {
  const { user } = useAuth();
  const [isImagesLoading, setIsImagesLoading] = useState(false);

  useEffect(() => {
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
                .eq('user_id', user.id)
                .single();

              return {
                url: urlData.publicUrl,
                path: `${projectId}/${item.name}`,
                size: item.metadata?.size || 0,
                name: item.name,
                createdAt: new Date(item.created_at || Date.now()),
                summary: summaryData?.summary || undefined
              };
            })
          );

          const sortedImages = imageUrls.sort((a, b) => 
            b.createdAt.getTime() - a.createdAt.getTime()
          );

          onImagesUpdated(sortedImages, sortedImages.slice(0, 3));
        }
      } catch (error: any) {
        console.error('Error fetching images:', error);
      } finally {
        setIsImagesLoading(false);
      }
    };

    fetchProjectImages();
  }, [projectId, user, onImagesUpdated]);

  const handleImageUploadComplete = (imageUrl: string) => {
    // Refresh the project images
    const fetchUpdatedImages = async () => {
      if (!projectId || !user) return;

      try {
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
                createdAt: new Date(item.created_at || Date.now())
              };
            })
          );

          const sortedImages = imageUrls.sort((a, b) => 
            b.createdAt.getTime() - a.createdAt.getTime()
          );

          onImagesUpdated(sortedImages, sortedImages.slice(0, 3));
        }
      } catch (error: any) {
        console.error('Error fetching updated images:', error);
      }
    };

    fetchUpdatedImages();
    toast.success('Image uploaded successfully');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Images</CardTitle>
        <CardDescription>
          Upload and manage images for this project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProjectImageUpload 
          projectId={projectId} 
          onUploadComplete={handleImageUploadComplete}
        />
      </CardContent>
    </Card>
  );
};

export default ProjectImages;
