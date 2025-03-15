import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileWarning, Trash2, Copy, Link, PencilLine } from 'lucide-react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from 'sonner';
import ImageSummaryButton from '@/components/ImageSummaryButton';
import ImageTagManager from '@/components/ImageTagManager';
import { formatFileSize } from '@/utils/fileUtils';
import { UploadedImage } from './GalleryDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { useImageManagement } from '@/hooks/useImageManagement';
import RenameImageDialog from './RenameImageDialog';
import ImageFilters from './ImageFilters';

interface ImageGridProps {
  uploadedImages: UploadedImage[];
  isLoading: boolean;
  onDeleteImage: (imagePath: string) => Promise<void>;
  projectId: string;
  onImageRenamed?: () => void;
  inGalleryDialog?: boolean;
}

const ImageGrid: React.FC<ImageGridProps> = ({
  uploadedImages,
  isLoading,
  onDeleteImage,
  projectId,
  onImageRenamed,
  inGalleryDialog
}) => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imageToRename, setImageToRename] = useState<UploadedImage | null>(null);
  
  const { isRenaming, renameImage } = useImageManagement({ projectId });
  
  // Extract all unique tags from images
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    uploadedImages.forEach(image => {
      if (image.tags && image.tags.length > 0) {
        image.tags.forEach(tag => {
          tags.add(tag.tag);
        });
      }
    });
    return Array.from(tags).sort();
  }, [uploadedImages]);
  
  // Filter images based on search query and selected tags
  const filteredImages = useMemo(() => {
    return uploadedImages.filter(image => {
      // Filter by search query
      const matchesSearch = !searchQuery || 
        image.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by selected tags
      const matchesTags = selectedTags.length === 0 || 
        (image.tags && image.tags.some(tag => selectedTags.includes(tag.tag)));
      
      return matchesSearch && matchesTags;
    });
  }, [uploadedImages, searchQuery, selectedTags]);
  
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
  
  const handleRenameImage = async (newName: string) => {
    if (!imageToRename) return false;
    
    const success = await renameImage(
      imageToRename.path,
      imageToRename.name,
      newName
    );
    
    if (success && onImageRenamed) {
      onImageRenamed();
    }
    
    return success;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (uploadedImages.length === 0) {
    return (
      <div className="text-center py-10 bg-muted/50 rounded-lg">
        <FileWarning className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
        <p className="text-muted-foreground">No images have been uploaded yet</p>
      </div>
    );
  }

  return (
    <>
      <ImageFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        allTags={allTags}
        selectedTags={selectedTags}
        onTagSelect={handleTagSelect}
        onClearFilters={clearFilters}
      />
      
      {filteredImages.length === 0 ? (
        <div className="text-center py-10 bg-muted/50 rounded-lg">
          <FileWarning className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">No images match your filters</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredImages.map((image) => (
            <Card key={image.path} className="overflow-hidden">
              <div className="relative h-48 sm:h-40">
                <img 
                  src={image.url} 
                  alt={image.name} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute top-2 right-2 flex space-x-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          className="h-7 w-7 opacity-80 hover:opacity-100"
                          onClick={() => onDeleteImage(image.path)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <CardContent className="p-3">
                <div className="truncate">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm truncate" title={image.name}>
                      {image.name}
                    </p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={() => setImageToRename(image)}
                          >
                            <PencilLine className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Rename</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {formatFileSize(image.size)}
                  </p>
                  {image.tags && image.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {image.tags.slice(0, 3).map(tag => (
                        <Badge key={tag.id} variant="outline" className="text-xs px-1 py-0">
                          {tag.tag}
                        </Badge>
                      ))}
                      {image.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          +{image.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <ImageSummaryButton 
                    imageUrl={image.url}
                    imageName={image.name}
                  />
                  
                  <ImageTagManager 
                    imageUrl={image.url}
                    projectId={image.path.split('/')[0]}
                  />
                    
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs px-2 py-1 h-7 flex items-center gap-1.5"
                    onClick={() => {
                      navigator.clipboard.writeText(image.url);
                      toast.success('Image URL copied to clipboard');
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy URL</span>
                  </Button>
                </div>
                
                <div className="mt-2 relative">
                  <Input
                    value={image.url}
                    readOnly
                    onClick={(e) => e.currentTarget.select()}
                    className="text-xs pr-8"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 absolute right-1 top-1/2 -translate-y-1/2"
                    onClick={() => window.open(image.url, '_blank')}
                    title="Open image in new tab"
                  >
                    <Link className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <RenameImageDialog
        isOpen={!!imageToRename}
        onOpenChange={(open) => {
          if (!open) setImageToRename(null);
        }}
        onRename={handleRenameImage}
        imageName={imageToRename?.name || ''}
        isRenaming={isRenaming}
      />
    </>
  );
};

export default ImageGrid;
