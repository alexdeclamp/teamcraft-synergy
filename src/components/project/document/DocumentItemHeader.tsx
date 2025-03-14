
import React from 'react';
import { File } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DocumentItemHeaderProps {
  fileName: string;
  createdAt: string;
}

const DocumentItemHeader: React.FC<DocumentItemHeaderProps> = ({ 
  fileName, 
  createdAt 
}) => {
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  };

  return (
    <div className="flex items-center space-x-3 overflow-hidden">
      <div className="p-2 bg-muted rounded-md flex-shrink-0">
        <File className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-medium text-sm sm:text-base truncate">{fileName}</h4>
        <p className="text-xs text-muted-foreground">
          {formatDate(createdAt)}
        </p>
      </div>
    </div>
  );
};

export default DocumentItemHeader;
