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
}

export const useImageUpload = ({
  projectId,
  userId,
  maxWidth = 1200,
  maxHeight = 1200,
  maxSizeInMB = 2,
  onUploadComplete
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

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

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
        const imagesWithPaths = await Promise.all(
          data.map(async (item) => {
            const { data: urlData } = await supabase
              .storage
              .from('project_images')
              .getPublicUrl(`${projectId}/${item.name}`);

            const imagePath = `${projectId}/${item.name}`;
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

        setUploadedImages(imagesWithPaths);
      }
    } catch (error: any) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load uploaded images');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, userId]);

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
      const { error } = await supabase
        .storage
        .from('project_images')
        .remove([imagePath]);
        
      if (error) throw error;
      
      setUploadedImages(uploadedImages.filter(img => img.path !== imagePath));
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
