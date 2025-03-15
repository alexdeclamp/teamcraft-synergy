
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UploadedImage } from '@/types/project';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  // Load deleted image paths from localStorage
  const getDeletedImagePaths = useCallback(() => {
    if (!projectId) return [];
    
    const storedDeletedPaths = localStorage.getItem(`deletedImages-${projectId}`);
    return storedDeletedPaths ? JSON.parse(storedDeletedPaths) : [];
  }, [projectId]);

  const fetchProjectImages = useCallback(async () => {
    if (!projectId || !userId) return;

    try {
      setIsImagesLoading(true);
      
      // Get deleted image paths from localStorage
      const deletedImagePaths = getDeletedImagePaths();
      
      // Try to fetch the list of images from the storage bucket
      const { data, error } = await supabase
        .storage
        .from('project_images')
        .list(`${projectId}`);

      if (error) {
        // Handle the case where the bucket or folder might not exist yet
        console.error('Error fetching images:', error);
        
        // If this is a 404 or other error, just set empty arrays
        setProjectImages([]);
        setRecentImages([]);
        return;
      }

      if (data && data.length > 0) {
        try {
          const imageUrls = await Promise.all(
            data.map(async (item) => {
              try {
                const imagePath = `${projectId}/${item.name}`;
                
                // Skip this image if it's in the deletedImagePaths array
                if (deletedImagePaths.includes(imagePath)) {
                  console.log('useProjectImages skipping deleted image:', imagePath);
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

                // Add cache-busting for mobile
                const imageUrl = isMobile 
                  ? `${urlData.publicUrl}?t=${new Date().getTime()}` 
                  : urlData.publicUrl;

                return {
                  url: imageUrl,
                  path: imagePath,
                  size: item.metadata?.size || 0,
                  name: item.name,
                  createdAt: new Date(item.created_at || Date.now()),
                  summary: summaryData?.summary || undefined
                };
              } catch (imageError) {
                console.error('Error processing image item:', imageError);
                return null;
              }
            })
          );

          // Filter out any null entries from failed image processing or deleted images
          const validImages = imageUrls.filter(img => img !== null) as UploadedImage[];
          
          const sortedImages = validImages.sort((a, b) => 
            b.createdAt.getTime() - a.createdAt.getTime()
          );

          setProjectImages(sortedImages);
          setRecentImages(sortedImages.slice(0, 3));
          
          console.log('useProjectImages processed images after filtering:', sortedImages.length);
        } catch (processingError) {
          console.error('Error processing images:', processingError);
          setProjectImages([]);
          setRecentImages([]);
        }
      } else {
        // No images found
        setProjectImages([]);
        setRecentImages([]);
      }
    } catch (error: any) {
      console.error('Error fetching images:', error);
      // Set empty arrays to prevent UI issues
      setProjectImages([]);
      setRecentImages([]);
    } finally {
      setIsImagesLoading(false);
    }
  }, [projectId, userId, isMobile, getDeletedImagePaths]);

  // Initial fetch of images when hook is initialized
  useEffect(() => {
    if (projectId && userId) {
      fetchProjectImages();
    }
  }, [projectId, userId, fetchProjectImages]);

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
