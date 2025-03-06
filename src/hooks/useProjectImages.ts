
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UploadedImage } from '@/types/project';
import { toast } from 'sonner';

interface UseProjectImagesResult {
  projectImages: UploadedImage[];
  recentImages: UploadedImage[];
  isImagesLoading: boolean;
  handleImagesUpdated: (images: UploadedImage[], recent: UploadedImage[]) => void;
  fetchProjectImages: () => Promise<void>;
}

export const useProjectImages = (
  projectId: string | undefined,
  userId: string | undefined
): UseProjectImagesResult => {
  const [projectImages, setProjectImages] = useState<UploadedImage[]>([]);
  const [recentImages, setRecentImages] = useState<UploadedImage[]>([]);
  const [isImagesLoading, setIsImagesLoading] = useState(false);

  const fetchProjectImages = useCallback(async () => {
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
              .eq('project_id', projectId)
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
      toast.error('Failed to load project images');
    } finally {
      setIsImagesLoading(false);
    }
  }, [projectId, userId]);

  // Initial fetch of images when hook is initialized
  useEffect(() => {
    if (projectId && userId && !isImagesLoading && projectImages.length === 0) {
      fetchProjectImages();
    }
  }, [projectId, userId, fetchProjectImages, isImagesLoading, projectImages.length]);

  const handleImagesUpdated = (images: UploadedImage[], recent: UploadedImage[]) => {
    setProjectImages(images);
    setRecentImages(recent);
  };

  return {
    projectImages,
    recentImages,
    isImagesLoading,
    handleImagesUpdated,
    fetchProjectImages
  };
};
