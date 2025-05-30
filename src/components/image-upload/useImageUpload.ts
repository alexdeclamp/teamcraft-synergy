
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { compressImage, sanitizeFileName } from './utils/imageProcessing';
import { UploadedImage } from './GalleryDialog';

interface UseImageUploadProps {
  projectId: string;
  userId: string | undefined;
  maxWidth?: number;
  maxHeight?: number;
  maxSizeInMB?: number;
  onUploadComplete?: (imageUrl: string, imagePath: string) => void;
  deletedImagePaths?: string[];
}

export const useImageUpload = ({
  projectId,
  userId,
  maxWidth = 1200,
  maxHeight = 1200,
  maxSizeInMB = 2,
  onUploadComplete,
  deletedImagePaths = []
}: UseImageUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [localDeletedImagePaths, setLocalDeletedImagePaths] = useState<string[]>(deletedImagePaths);

  // Sync with parent component's deletedImagePaths
  useEffect(() => {
    setLocalDeletedImagePaths(deletedImagePaths);
  }, [deletedImagePaths]);

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  // Update deleted paths in localStorage when they change
  useEffect(() => {
    if (projectId) {
      localStorage.setItem(`deletedImages-${projectId}`, JSON.stringify(localDeletedImagePaths));
    }
  }, [localDeletedImagePaths, projectId]);

  const fetchUploadedImages = useCallback(async () => {
    if (!projectId || !userId) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .storage
        .from('project_images')
        .list(`${projectId}`);

      if (error) throw error;

      if (data) {
        console.log('useImageUpload fetched images:', data.length);
        console.log('useImageUpload deleted paths:', localDeletedImagePaths);
        
        const imagesWithPaths = await Promise.all(
          data.map(async (item) => {
            const imagePath = `${projectId}/${item.name}`;
            
            // Skip this image if it's in our deletedImagePaths array
            if (localDeletedImagePaths.includes(imagePath)) {
              console.log('useImageUpload skipping deleted image:', imagePath);
              return null;
            }

            const { data: urlData } = await supabase
              .storage
              .from('project_images')
              .getPublicUrl(imagePath);

            const imageUrl = urlData.publicUrl;
            
            const { data: tagData, error: tagError } = await supabase
              .from('image_tags')
              .select('*')
              .eq('image_url', imageUrl)
              .eq('project_id', projectId);

            if (tagError) {
              console.error('Error fetching tags for image:', tagError);
            }

            return {
              url: imageUrl,
              path: imagePath,
              size: item.metadata?.size || 0,
              name: item.name,
              createdAt: new Date(item.created_at || Date.now()),
              tags: tagData || []
            };
          })
        );

        // Filter out null values (deleted images)
        const filteredImages = imagesWithPaths.filter(img => img !== null) as UploadedImage[];
        console.log('useImageUpload processed images after filtering:', filteredImages.length);
        
        setUploadedImages(filteredImages);
      }
    } catch (error: any) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load uploaded images');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, userId, localDeletedImagePaths]);

  useEffect(() => {
    if (projectId && userId) {
      fetchUploadedImages();
    }
  }, [fetchUploadedImages, projectId, userId]);

  const resetUpload = () => {
    setSelectedFile(null);
    setPreview(null);
    setUploadProgress(0);
    setErrorMessage(null);
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

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !projectId || !userId) return;
    
    try {
      setErrorMessage(null);
      setIsUploading(true);
      setUploadProgress(10);
      
      const compressedImage = await compressImage(selectedFile, maxWidth, maxHeight);
      setUploadProgress(40);

      const sanitizedFileName = sanitizeFileName(`${Date.now()}-${selectedFile.name}`);
      const filePath = `${projectId}/${sanitizedFileName}`;
      
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
      
      await fetchUploadedImages();
      
      setIsDialogOpen(false);
      resetUpload();
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setErrorMessage(error.message || 'Failed to upload image');
      toast.error('Failed to upload image: ' + (error.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imagePath: string) => {
    if (!userId) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this image?');
    if (!confirmed) return;
    
    try {
      // First, find the image and its URL in our local state
      const imageToDelete = uploadedImages.find(img => img.path === imagePath);
      
      if (!imageToDelete) {
        toast.error('Image not found');
        return;
      }
      
      // Delete the image from storage
      const { error: storageError } = await supabase
        .storage
        .from('project_images')
        .remove([imagePath]);
        
      if (storageError) throw storageError;
      
      // Delete any tags associated with this image
      const { error: tagError } = await supabase
        .from('image_tags')
        .delete()
        .eq('image_url', imageToDelete.url)
        .eq('project_id', projectId);
      
      if (tagError) {
        console.error('Error deleting image tags:', tagError);
      }
      
      // Delete any summaries associated with this image
      const { error: summaryError } = await supabase
        .from('image_summaries')
        .delete()
        .eq('image_url', imageToDelete.url)
        .eq('project_id', projectId);
      
      if (summaryError) {
        console.error('Error deleting image summary:', summaryError);
      }
      
      // Update our local state by filtering out the deleted image
      setUploadedImages(prev => prev.filter(img => img.path !== imagePath));
      
      // Add the path to our deletedImagePaths array to prevent it from reappearing
      const updatedDeletedPaths = [...localDeletedImagePaths, imagePath];
      setLocalDeletedImagePaths(updatedDeletedPaths);
      
      // Persist to localStorage
      localStorage.setItem(`deletedImages-${projectId}`, JSON.stringify(updatedDeletedPaths));
      
      console.log('Image deleted successfully:', imagePath);
      console.log('Updated deleted paths:', updatedDeletedPaths);
      
      toast.success('Image deleted successfully');
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  return {
    selectedFile,
    preview,
    isUploading,
    uploadProgress,
    uploadedImages,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    isGalleryDialogOpen,
    setIsGalleryDialogOpen,
    errorMessage,
    resetUpload,
    handleFileSelect,
    handleUpload,
    handleDeleteImage,
    fetchUploadedImages
  };
};
