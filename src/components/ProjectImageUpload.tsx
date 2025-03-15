
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useImageUpload } from './image-upload/useImageUpload';
import ImageGrid from './image-upload/ImageGrid';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, ImageIcon, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import GalleryDialog from './image-upload/GalleryDialog';
import ImageFilters from './image-upload/ImageFilters';
import { Progress } from '@/components/ui/progress';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
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
    handleDeleteImage,
    fetchUploadedImages
  } = useImageUpload({
    projectId,
    userId: user?.id,
    maxWidth,
    maxHeight,
    maxSizeInMB,
    onUploadComplete
  });

  // Extract all unique tags from images
  const allTags = uploadedImages
    .flatMap(img => img.tags?.map(t => t.tag) || [])
    .filter((tag, index, self) => tag && self.indexOf(tag) === index)
    .sort();

  // Filter images based on search query and selected tags
  const filteredImages = uploadedImages.filter(img => {
    const matchesSearch = !searchQuery || 
      img.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => 
        img.tags?.some(t => t.tag.toLowerCase() === tag.toLowerCase())
      );
    
    return matchesSearch && matchesTags;
  });

  const handleTagSelect = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
  };

  return (
    <div className="space-y-6">
      {/* Image Upload Form */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full">
            <label 
              htmlFor="image-upload" 
              className="flex items-center justify-center gap-3 cursor-pointer bg-muted hover:bg-muted/80 text-foreground font-medium px-6 py-4 rounded-md border-2 border-dashed border-border h-20 transition-colors w-full"
            >
              <ImageIcon className="h-7 w-7" />
              <span className="text-lg font-semibold">Choose Images</span>
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
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <ImageIcon className="mr-2 h-4 w-4" />
                <span className="truncate max-w-[300px]">{selectedFile.name}</span>
                <span className="ml-2">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
              {preview && (
                <div className="relative w-full max-w-[200px] h-[100px] overflow-hidden rounded-md border border-border">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            
            <Alert variant="default" className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription>
                Click the "Upload Image" button below to complete the upload process.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || isUploading} 
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
          </div>
        )}
        
        {isUploading && (
          <div className="space-y-3 mt-4">
            <Progress value={uploadProgress} className="h-2" />
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-sm text-muted-foreground">
                {uploadProgress < 40 && "Preparing image..."}
                {uploadProgress >= 40 && uploadProgress < 70 && "Uploading image..."}
                {uploadProgress >= 70 && uploadProgress < 90 && "Processing image..."}
                {uploadProgress >= 90 && "Finalizing..."}
              </p>
            </div>
          </div>
        )}
        
        {uploadProgress === 100 && !isUploading && !selectedFile && (
          <div className="p-3 rounded-md bg-green-50 text-green-600 text-sm flex items-start">
            <ImageIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <div>Image uploaded successfully</div>
          </div>
        )}
      </div>
      
      {/* Image Gallery Dialog Button */}
      <div className="flex mb-4">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 ml-auto"
          onClick={() => setIsGalleryDialogOpen(true)}
        >
          <ImageIcon className="h-4 w-4" />
          View All Images
        </Button>
      </div>
      
      {/* Filters and Search */}
      {uploadedImages.length > 0 && (
        <ImageFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          allTags={allTags}
          selectedTags={selectedTags}
          onTagSelect={handleTagSelect}
          onClearFilters={clearFilters}
        />
      )}
      
      {/* Image Grid */}
      <ImageGrid
        uploadedImages={filteredImages}
        isLoading={isLoading}
        onDeleteImage={handleDeleteImage}
        projectId={projectId}
        onImageRenamed={fetchUploadedImages}
      />
      
      {/* Dialogs */}
      <GalleryDialog
        isOpen={isGalleryDialogOpen}
        onOpenChange={setIsGalleryDialogOpen}
        uploadedImages={filteredImages}
        isLoading={isLoading}
        onDeleteImage={handleDeleteImage}
        projectId={projectId}
        onImageRenamed={fetchUploadedImages}
      />
    </div>
  );
};

export default ProjectImageUpload;
