
import React from 'react';
import { FileText, Image, ExternalLink } from 'lucide-react';

interface SourceDocument {
  type: 'pdf' | 'image';
  url: string;
  name: string;
}

interface NoteSourceDocumentProps {
  sourceDocument: SourceDocument | null | undefined;
}

const NoteSourceDocument: React.FC<NoteSourceDocumentProps> = ({ sourceDocument }) => {
  if (!sourceDocument) return null;
  
  return (
    <div className="mb-4 p-3 bg-muted/40 rounded-md text-sm border border-muted-foreground/20">
      <div className="flex items-center overflow-hidden mb-1">
        {sourceDocument.type === 'pdf' ? (
          <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
        ) : (
          <Image className="h-4 w-4 text-green-500 flex-shrink-0" />
        )}
        <span className="text-muted-foreground ml-1 mr-1 flex-shrink-0">Source:</span>
        <span className="font-medium truncate">{sourceDocument.name}</span>
      </div>
      <a 
        href={sourceDocument.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center text-primary hover:underline flex-shrink-0"
      >
        <ExternalLink className="h-4 w-4 mr-1" />
        <span>View</span>
      </a>
    </div>
  );
};

export default NoteSourceDocument;
