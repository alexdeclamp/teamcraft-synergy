
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ImageGrid from './ImageGrid';
import { Image } from 'lucide-react';
import ImageFilters from './ImageFilters';
import { useState, useEffect } from 'react';

export interface UploadedImage {
  url: string;
  path: string;
  size: number;
  name: string;
  createdAt: Date;
  tags?: Array<{ id: string; tag: string }>;
  summary?: string;
}

interface GalleryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  uploadedImages: UploadedImage[];
  isLoading: boolean;
  onDeleteImage: (imagePath: string) => Promise<void>;
  projectId: string;
  onImageRenamed?: () => void;
}

const GalleryDialog: React.FC<GalleryDialogProps> = ({
  isOpen,
  onOpenChange,
  uploadedImages,
  isLoading,
  onDeleteImage,
  projectId,
  onImageRenamed
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filteredImages, setFilteredImages] = useState<UploadedImage[]>(uploadedImages);
  
  // Extract all unique tags from images
  const allTags = Array.from(
    new Set(
      uploadedImages
        .flatMap(img => img.tags || [])
        .map(tag => tag.tag)
    )
  );

  // Filter images when search query or selected tags change
  useEffect(() => {
    let filtered = [...uploadedImages];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(img => 
        img.name.toLowerCase().includes(query)
      );
    }
    
    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(img => 
        selectedTags.every(tag => 
          img.tags?.some(t => t.tag === tag)
        )
      );
    }
    
    setFilteredImages(filtered);
  }, [uploadedImages, searchQuery, selectedTags]);

  const handleTagSelect = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Project Images
          </DialogTitle>
          <DialogDescription>
            View, manage, and organize all images uploaded to this project
          </DialogDescription>
        </DialogHeader>
        
        <ImageFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          allTags={allTags}
          selectedTags={selectedTags}
          onTagSelect={handleTagSelect}
          onClearFilters={handleClearFilters}
        />
        
        <ImageGrid 
          uploadedImages={filteredImages}
          isLoading={isLoading}
          onDeleteImage={onDeleteImage}
          projectId={projectId}
          onImageRenamed={onImageRenamed}
          inGalleryDialog={true}
        />
      </DialogContent>
    </Dialog>
  );
};

export default GalleryDialog;
