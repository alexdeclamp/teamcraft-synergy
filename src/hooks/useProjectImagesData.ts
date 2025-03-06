
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

interface UseProjectImagesDataResult {
  projectImages: UploadedImage[];
  recentImages: UploadedImage[];
  isImagesLoading: boolean;
  handleImagesUpdated: (images: UploadedImage[], recent: UploadedImage[]) => void;
  fetchProjectImages: () => Promise<void>;
}

export const useProjectImagesData = (
  projectId: string | undefined,
  userId: string | null
): UseProjectImagesDataResult => {
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
            
            // Fetch summary and metadata if exists
            const { data: imageMeta } = await supabase
              .from('image_summaries')
              .select('summary, is_favorite, is_important, is_archived')
              .eq('image_url', urlData.publicUrl)
              .eq('project_id', projectId)
              .single();

            return {
              url: urlData.publicUrl,
              path: `${projectId}/${item.name}`,
              size: item.metadata?.size || 0,
              name: item.name,
              createdAt: new Date(item.created_at || Date.now()),
              summary: imageMeta?.summary || undefined,
              is_favorite: imageMeta?.is_favorite || false,
              is_important: imageMeta?.is_important || false,
              is_archived: imageMeta?.is_archived || false
            };
          })
        );

        const sortedImages = imageUrls.sort((a, b) => 
          b.createdAt.getTime() - a.createdAt.getTime()
        );

        setProjectImages(sortedImages);
        
        // Filter out archived images for the recent images display
        const filteredImages = sortedImages.filter(img => !img.is_archived);
        setRecentImages(filteredImages.slice(0, 3));
      }
    } catch (error: any) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load project images');
    } finally {
      setIsImagesLoading(false);
    }
  }, [projectId, userId]);

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
