
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, RefreshCw } from 'lucide-react';
import { DocumentItem } from './DocumentItem';

interface Document {
  id: string;
  file_name: string;
  file_url: string;
  created_at: string;
  document_type: string;
  file_size?: number;
  metadata?: {
    pdf_url?: string;
    associatedNoteId?: string;
  };
}

interface DocumentsListProps {
  documents: Document[];
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  projectId: string;
}

export const DocumentsList: React.FC<DocumentsListProps> = ({
  documents,
  isLoading,
  isRefreshing,
  onRefresh,
  projectId
}) => {
  return (
    <div className="border rounded-lg shadow-sm">
      <div className="flex items-center justify-between p-4 border-b bg-muted/40">
        <h3 className="font-medium text-lg">Uploaded Documents</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={isLoading || isRefreshing}
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No documents uploaded yet</p>
            <p className="text-sm mt-1">Upload your first document above</p>
          </div>
        ) : (
          <ScrollArea className="h-[350px] pr-4">
            <div className="space-y-2">
              {documents.map((doc) => (
                <DocumentItem key={doc.id} document={doc} projectId={projectId} />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};
