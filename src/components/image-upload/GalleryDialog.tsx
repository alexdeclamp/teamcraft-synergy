
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
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Search images..."
              className="px-3 py-2 border rounded-md flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            {selectedTags.length > 0 && (
              <button 
                onClick={handleClearFilters}
                className="px-3 py-2 bg-red-50 text-red-800 rounded-md text-sm"
              >
                Clear filters ({selectedTags.length})
              </button>
            )}
          </div>
          
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagSelect(tag)}
                  className={`px-2 py-1 text-xs rounded-full ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
        
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
