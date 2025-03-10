
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Loader2, FileText, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DocumentUploadFormProps {
  files: File[];
  isUploading: boolean;
  createNote: boolean;
  onFilesChange: (files: File[]) => void;
  onCreateNoteChange: (checked: boolean) => void;
  onUpload: () => void;
  model?: string;
  onModelChange?: (model: string) => void;
}

export const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({
  files,
  isUploading,
  createNote,
  onFilesChange,
  onCreateNoteChange,
  onUpload,
  model,
  onModelChange
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);
      onFilesChange(fileArray);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full">
          <label 
            htmlFor="pdf-upload" 
            className="flex items-center justify-center gap-2 cursor-pointer bg-muted hover:bg-muted/80 text-foreground font-medium px-4 py-3 rounded-md border-2 border-dashed border-border h-16 transition-colors w-full"
          >
            <FileText className="h-6 w-6" />
            <span className="text-base">Choose PDF Files</span>
          </label>
          <Input 
            id="pdf-upload" 
            type="file" 
            accept=".pdf" 
            onChange={handleFileChange} 
            disabled={isUploading} 
            multiple 
            className="sr-only" 
          />
        </div>
      </div>
      
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center text-sm text-muted-foreground">
                <FileText className="mr-2 h-4 w-4" />
                <span className="truncate max-w-[300px]">{file.name}</span>
                <span className="ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            ))}
          </div>
          
          {files.length > 0 && (
            <Alert variant="default" className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription>
                Click the "Upload PDF{files.length > 1 ? 's' : ''}" button below to complete the upload process.
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={onUpload} 
            disabled={files.length === 0 || isUploading} 
            className="whitespace-nowrap w-full h-12 text-base"
            size="lg"
          >
            {isUploading ? <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Uploading...
            </> : <>
              <Upload className="mr-2 h-5 w-5" />
              Upload PDF{files.length > 1 ? 's' : ''}
            </>}
          </Button>
        </div>
      )}

      {onModelChange && (
        <div className="flex justify-end mt-2">
          <Select value={model || 'claude'} onValueChange={(value: 'claude' | 'openai') => onModelChange(value)}>
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="Select AI Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="claude">Claude</SelectItem>
              <SelectItem value="openai">OpenAI (GPT-4o mini)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
