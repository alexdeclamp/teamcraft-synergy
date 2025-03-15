
import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DocumentItem from './DocumentItem';

interface DocumentsListProps {
  documents: any[];
  isLoading: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  projectId: string;
}

export const DocumentsList: React.FC<DocumentsListProps> = ({
  documents,
  isLoading,
  isRefreshing = false,
  onRefresh,
  projectId
}) => {
  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No documents have been uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end mb-4">
        {onRefresh && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh} 
            disabled={isRefreshing}
            className="h-8"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>
      
      <div className="space-y-0">
        {documents.map((document, index) => (
          <DocumentItem 
            key={document.id}
            document={document} 
            onDelete={onRefresh} 
            onRefresh={onRefresh}
            projectId={projectId}
            isLast={index === documents.length - 1}
          />
        ))}
      </div>
    </div>
  );
};
