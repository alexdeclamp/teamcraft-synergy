
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useImageUpload } from './image-upload/useImageUpload';
import ImageGrid from './image-upload/ImageGrid';
import { ContentAlert } from '@/components/ui/content-alert';
import { File, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Loader2, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatFileSize } from '@/utils/fileUtils';

interface ProjectImageUploadProps {
  projectId: string;
  onUploadComplete?: (imageUrl: string, imagePath: string) => void;
  maxWidth?: number;
  maxHeight?: number;
  maxSizeInMB?: number;
  deletedImagePaths?: string[];
}

const ProjectImageUpload: React.FC<ProjectImageUploadProps> = ({
  projectId,
  onUploadComplete,
  maxWidth = 1600,
  maxHeight = 1600,
  maxSizeInMB = 5,
  deletedImagePaths = []
}) => {
  const { user } = useAuth();
  
  const {
    selectedFile,
    preview,
    isUploading,
    uploadProgress,
    uploadedImages,
    isLoading,
    isGalleryDialogOpen,
    setIsGalleryDialogOpen,
    errorMessage,
    resetUpload,
    handleFileSelect,
    handleUpload,
    handleDeleteImage,
    fetchUploadedImages
  } = useImageUpload({
    projectId,
    userId: user?.id,
    maxWidth,
    maxHeight,
    maxSizeInMB,
    onUploadComplete,
    deletedImagePaths
  });
  
  const onDeleteImage = async (imagePath: string) => {
    await handleDeleteImage(imagePath);
  };

  return (
    <div>
      <ContentAlert 
        message="Image content is not directly accessible to the project chat assistant. Generate notes from your images to make their content available."
        documentType="image"
      />
      
      <div className="border rounded-lg shadow-sm">
        <div className="flex items-center gap-2 p-4 border-b bg-muted/40">
          <Image className="h-5 w-5" />
          <h3 className="font-medium text-lg">Upload Images</h3>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full">
                <label 
                  htmlFor="image-upload" 
                  className="flex items-center justify-center gap-3 cursor-pointer bg-muted hover:bg-muted/80 text-foreground font-medium px-6 py-4 rounded-md border-2 border-dashed border-border h-20 transition-colors w-full"
                >
                  <Image className="h-7 w-7" />
                  <span className="text-lg font-semibold">Choose Image Files</span>
                </label>
                <Input 
                  id="image-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileSelect} 
                  disabled={isUploading} 
                  className="sr-only" 
                />
              </div>
            </div>
            
            {selectedFile && (
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Image className="mr-2 h-4 w-4" />
                  <span className="truncate max-w-[300px]">{selectedFile.name}</span>
                  <span className="ml-2">({formatFileSize(selectedFile.size)})</span>
                </div>
                
                {preview && (
                  <div className="mt-4 relative rounded-md overflow-hidden max-w-xs">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="max-h-[200px] object-contain bg-muted/50"
                    />
                  </div>
                )}
                
                <Alert variant="default" className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription>
                    Click the "Upload Image" button below to complete the upload process.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {selectedFile && (
              <Button 
                onClick={handleUpload} 
                disabled={isUploading} 
                className="whitespace-nowrap w-full h-12 text-base"
                size="lg"
              >
                {isUploading ? <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Uploading...
                </> : <>
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Image
                </>}
              </Button>
            )}
          </div>
          
          {/* Upload Status */}
          <div className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">Error uploading image</p>
                  <p>{errorMessage}</p>
                  <p className="mt-2 text-xs">If this error persists, please try again or check your network connection.</p>
                </div>
              </div>
            )}
            
            {isUploading && (
              <div className="space-y-3">
                <Progress value={uploadProgress} className="h-2" />
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    {uploadProgress < 40 && "Preparing image..."}
                    {uploadProgress >= 40 && uploadProgress < 70 && "Compressing image..."}
                    {uploadProgress >= 70 && uploadProgress < 90 && "Uploading image..."}
                    {uploadProgress >= 90 && "Finalizing..."}
                  </p>
                </div>
              </div>
            )}
            
            {uploadProgress === 100 && !isUploading && selectedFile && (
              <div className="p-3 rounded-md bg-green-50 text-green-600 text-sm flex items-start">
                <Image className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <div>Image uploaded successfully</div>
              </div>
            )}
            
            {uploadProgress === 100 && !isUploading && selectedFile && (
              <Button variant="outline" size="sm" onClick={resetUpload}>
                Upload More Images
              </Button>
            )}
          </div>
          
          {/* Gallery button - Changed to toggle button */}
          <div className="flex justify-end">
            <Button 
              variant={isGalleryDialogOpen ? "default" : "outline"}
              onClick={() => setIsGalleryDialogOpen(!isGalleryDialogOpen)}
              className="mt-4"
            >
              {isGalleryDialogOpen ? "Hide Image Gallery" : "View Image Gallery"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Image Gallery - Always render, but conditionally show based on isGalleryDialogOpen */}
      <div className={`mt-6 ${isGalleryDialogOpen ? 'block' : 'hidden'}`}>
        <ImageGrid
          uploadedImages={uploadedImages}
          isLoading={isLoading}
          onDeleteImage={onDeleteImage}
          projectId={projectId}
          onImageRenamed={fetchUploadedImages}
          inGalleryDialog={false}
        />
      </div>
    </div>
  );
};

export default ProjectImageUpload;
