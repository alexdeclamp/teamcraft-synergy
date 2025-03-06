
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ImageTag {
  id: string;
  tag: string;
}

export interface UploadedImage {
  url: string;
  path: string;
  size: number;
  name: string;
  createdAt: Date;
  tags?: ImageTag[];
}

export function useProjectImages(projectId: string) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchImages();
    }
  }, [projectId]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      // Get all images from this project
      const { data, error } = await supabase.storage
        .from('project_images')
        .list(`${projectId}`);

      if (error) {
        throw error;
      }

      // Filter out folders (only get files)
      const filteredData = data.filter(item => !item.metadata?.is_dir);
      
      // Generate URLs for each image
      const imagesWithUrls = await Promise.all(
        filteredData.map(async (file) => {
          const { data: publicUrl } = supabase.storage
            .from('project_images')
            .getPublicUrl(`${projectId}/${file.name}`);
            
          // Get tags for this image
          const { data: tagData, error: tagError } = await supabase
            .from('image_tags')
            .select('id, tag')
            .eq('image_url', publicUrl.publicUrl);
            
          if (tagError) {
            console.error('Error fetching tags for image:', tagError);
          }
          
          const tags: ImageTag[] = tagData || [];
          
          return {
            url: publicUrl.publicUrl,
            path: `${projectId}/${file.name}`,
            size: file.metadata?.size || 0,
            name: file.name,
            createdAt: new Date(file.created_at || Date.now()),
            tags: tags
          };
        })
      );

      // Sort images by creation time
      const sortedImages = imagesWithUrls.sort((a, b) => {
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      setImages(sortedImages);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching project images:', error);
      setError(error.message || 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File) => {
    if (!projectId) {
      setError('Project ID is required');
      return null;
    }
    
    try {
      // Upload image to storage
      const { data, error } = await supabase.storage
        .from('project_images')
        .upload(`${projectId}/${file.name}`, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        throw error;
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('project_images')
        .getPublicUrl(data.path);

      // Create new image object
      const newImage: UploadedImage = {
        url: publicUrlData.publicUrl,
        path: data.path,
        size: file.size,
        name: file.name,
        createdAt: new Date(),
        tags: []
      };

      // Update state with new image
      setImages(prevImages => [newImage, ...prevImages]);
      return newImage;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setError(error.message || 'Failed to upload image');
      return null;
    }
  };

  const deleteImage = async (path: string) => {
    try {
      // Get the public URL to remove from image_summaries and image_tags
      const { data: publicUrlData } = supabase.storage
        .from('project_images')
        .getPublicUrl(path);
      
      // Delete the image from storage
      const { error } = await supabase.storage
        .from('project_images')
        .remove([path]);

      if (error) {
        throw error;
      }
      
      // Delete any summaries for this image
      await supabase
        .from('image_summaries')
        .delete()
        .eq('image_url', publicUrlData.publicUrl);
        
      // Delete any tags for this image
      await supabase
        .from('image_tags')
        .delete()
        .eq('image_url', publicUrlData.publicUrl);

      // Update state to remove deleted image
      setImages(prevImages => prevImages.filter(img => img.path !== path));
      return true;
    } catch (error: any) {
      console.error('Error deleting image:', error);
      setError(error.message || 'Failed to delete image');
      return false;
    }
  };

  return { images, loading, error, uploadImage, deleteImage, refreshImages: fetchImages };
}
