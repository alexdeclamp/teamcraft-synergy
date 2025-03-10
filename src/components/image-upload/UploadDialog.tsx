
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, X, Upload, ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatFileSize } from '@/utils/fileUtils';

interface UploadDialogProps {
  selectedFile: File | null;
  preview: string | null;
  isUploading: boolean;
  uploadProgress: number;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => Promise<void>;
  onReset: () => void;
  onOpenChange: (open: boolean) => void;
  isOpen: boolean;
  maxSizeInMB: number;
}

const UploadDialog: React.FC<UploadDialogProps> = ({
  selectedFile,
  preview,
  isUploading,
  uploadProgress,
  onFileSelect,
  onUpload,
  onReset,
  onOpenChange,
  isOpen,
  maxSizeInMB
}) => {
  const handleCloseDialog = () => {
    onReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Image
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Project Image</DialogTitle>
          <DialogDescription>
            Upload an image for your project. The image will be compressed to save space.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {!selectedFile ? (
            <div 
              className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:bg-accent/10 transition-colors"
              onClick={() => document.getElementById('image-input')?.click()}
            >
              <ImageIcon className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to select an image or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Maximum size: {maxSizeInMB} MB
              </p>
              <input
                id="image-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileSelect}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={preview || ''} 
                  alt="Preview" 
                  className="rounded-lg w-full object-cover max-h-[300px]" 
                />
                <Button 
                  variant="destructive" 
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 opacity-80 hover:opacity-100"
                  onClick={onReset}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-sm">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-muted-foreground text-xs">
                  Size: {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
          )}
          
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {uploadProgress === 100 ? 'Complete!' : 'Uploading...'}
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCloseDialog} disabled={isUploading}>
            Cancel
          </Button>
          <Button 
            onClick={onUpload} 
            disabled={!selectedFile || isUploading}
          >
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDialog;
