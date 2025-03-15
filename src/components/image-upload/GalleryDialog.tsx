
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
        
        <ImageGrid 
          uploadedImages={uploadedImages}
          isLoading={isLoading}
          onDeleteImage={onDeleteImage}
          projectId={projectId}
          onImageRenamed={onImageRenamed}
        />
      </DialogContent>
    </Dialog>
  );
};

export default GalleryDialog;
