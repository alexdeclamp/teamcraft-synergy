
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileWarning, Trash2, Info } from 'lucide-react';
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
import { formatFileSize } from '@/utils/fileUtils';
import { UploadedImage } from './GalleryDialog';

interface ImageGridProps {
  uploadedImages: UploadedImage[];
  isLoading: boolean;
  onDeleteImage: (imagePath: string) => Promise<void>;
}

const ImageGrid: React.FC<ImageGridProps> = ({
  uploadedImages,
  isLoading,
  onDeleteImage
}) => {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {uploadedImages.map((image) => (
        <Card key={image.path} className="overflow-hidden">
          <div className="relative h-40">
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
            <div className="flex justify-between items-start gap-2">
              <div className="truncate">
                <p className="font-medium text-sm truncate" title={image.name}>
                  {image.name}
                </p>
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
              <div className="flex space-x-1">
                <ImageSummaryButton 
                  imageUrl={image.url}
                  imageName={image.name}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 flex-shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(image.url);
                    toast.success('Image URL copied to clipboard');
                  }}
                >
                  <Info className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <Input
              value={image.url}
              readOnly
              onClick={(e) => e.currentTarget.select()}
              className="mt-2 text-xs"
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ImageGrid;
