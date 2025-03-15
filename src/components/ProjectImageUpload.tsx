
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useImageUpload } from './image-upload/useImageUpload';
import UploadDialog from './image-upload/UploadDialog';
import GalleryDialog from './image-upload/GalleryDialog';
import ImageGrid from './image-upload/ImageGrid';
import { ContentAlert } from '@/components/ui/content-alert';

interface ProjectImageUploadProps {
  projectId: string;
  onUploadComplete?: (imageUrl: string, imagePath: string) => void;
  maxWidth?: number;
  maxHeight?: number;
  maxSizeInMB?: number;
}

const ProjectImageUpload: React.FC<ProjectImageUploadProps> = ({
  projectId,
  onUploadComplete,
  maxWidth = 1600,
  maxHeight = 1600,
  maxSizeInMB = 5,
}) => {
  const { user } = useAuth();
  
  const {
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
    resetUpload,
    handleFileSelect,
    handleUpload,
    handleDeleteImage
  } = useImageUpload({
    projectId,
    userId: user?.id,
    maxWidth,
    maxHeight,
    maxSizeInMB,
    onUploadComplete
  });

  return (
    <div>
      <ContentAlert 
        message="Image content is not directly accessible to the project chat assistant. Generate notes from your images to make their content available."
        documentType="image"
      />
      
      <div className="flex flex-wrap gap-3 mb-6">
        <UploadDialog
          selectedFile={selectedFile}
          preview={preview}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          onFileSelect={handleFileSelect}
          onUpload={handleUpload}
          onReset={resetUpload}
          onOpenChange={setIsDialogOpen}
          isOpen={isDialogOpen}
          maxSizeInMB={maxSizeInMB}
        />

        <GalleryDialog
          isOpen={isGalleryDialogOpen}
          onOpenChange={setIsGalleryDialogOpen}
          uploadedImages={uploadedImages}
          isLoading={isLoading}
          onDeleteImage={handleDeleteImage}
        />
      </div>
      
      <ImageGrid
        uploadedImages={uploadedImages}
        isLoading={isLoading}
        onDeleteImage={handleDeleteImage}
      />
    </div>
  );
};

export default ProjectImageUpload;
