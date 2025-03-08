
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Loader2, FileText } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface DocumentUploadFormProps {
  file: File | null;
  isUploading: boolean;
  createNote: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCreateNoteChange: (checked: boolean) => void;
  onUpload: () => void;
}

export const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({
  file,
  isUploading,
  createNote,
  onFileChange,
  onCreateNoteChange,
  onUpload
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="w-full">
          <Input 
            id="pdf-upload" 
            type="file" 
            accept=".pdf" 
            onChange={onFileChange} 
            disabled={isUploading} 
            className="file:mr-4 file:rounded-md file:border-0 file:font-medium file:bg-primary/10 file:text-primary hover:file:cursor-pointer w-full h-12 px-[8px] mx-px py-[6px]" 
          />
        </div>
        <Button 
          onClick={onUpload} 
          disabled={!file || isUploading} 
          className="whitespace-nowrap w-full sm:w-auto h-12"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload PDF
            </>
          )}
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="createNote" 
          checked={createNote}
          onCheckedChange={onCreateNoteChange}
          disabled={isUploading}
        />
        <Label 
          htmlFor="createNote" 
          className="text-sm text-muted-foreground cursor-pointer"
        >
          Generate AI summary note from this PDF
        </Label>
      </div>
      
      {file && (
        <div className="flex items-center text-sm text-muted-foreground">
          <FileText className="mr-2 h-4 w-4" />
          <span className="truncate max-w-[300px]">{file.name}</span>
          <span className="ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
        </div>
      )}
    </div>
  );
};
