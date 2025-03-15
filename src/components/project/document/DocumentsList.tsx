
import React, { useState, useMemo } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DocumentItem from './DocumentItem';
import { SearchBar } from '@/components/ui/search-bar';

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
  const [searchQuery, setSearchQuery] = useState('');

  // Filter documents based on search query
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    
    const query = searchQuery.toLowerCase().trim();
    return documents.filter(doc => 
      doc.file_name.toLowerCase().includes(query)
    );
  }, [documents, searchQuery]);

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchBar
          placeholder="Search documents..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="flex-1"
        />
        
        {onRefresh && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh} 
            disabled={isRefreshing}
            className="h-9 whitespace-nowrap"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>
      
      {filteredDocuments.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-muted-foreground">No documents match your search</p>
        </div>
      ) : (
        <div className="space-y-0">
          {filteredDocuments.map((document, index) => (
            <DocumentItem 
              key={document.id}
              document={document} 
              onDelete={onRefresh} 
              onRefresh={onRefresh}
              projectId={projectId}
              isLast={index === filteredDocuments.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
