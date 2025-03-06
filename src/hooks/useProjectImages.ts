
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UploadedImage {
  url: string;
  path: string;
  size: number;
  name: string;
  createdAt: Date;
  summary?: string;
}

export const useProjectImages = (projectId: string | undefined, userId: string | undefined) => {
  const [projectImages, setProjectImages] = useState<UploadedImage[]>([]);
  const [recentImages, setRecentImages] = useState<UploadedImage[]>([]);
  const [isImagesLoading, setIsImagesLoading] = useState(false);

  useEffect(() => {
    const fetchProjectImages = async () => {
      if (!projectId || !userId) return;

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
                .eq('user_id', userId)
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

          setProjectImages(sortedImages);
          setRecentImages(sortedImages.slice(0, 3));
        }
      } catch (error: any) {
        console.error('Error fetching images:', error);
      } finally {
        setIsImagesLoading(false);
      }
    };

    fetchProjectImages();
  }, [projectId, userId]);

  const handleImageUploadComplete = async () => {
    if (!projectId || !userId) return;

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

        setProjectImages(sortedImages);
        setRecentImages(sortedImages.slice(0, 3));
      }
    } catch (error: any) {
      console.error('Error fetching updated images:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return {
    projectImages,
    recentImages,
    isImagesLoading,
    handleImageUploadComplete,
    formatFileSize
  };
};
