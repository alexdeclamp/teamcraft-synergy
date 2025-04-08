
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Loader2, FileIcon } from 'lucide-react';

interface NotionPageCardProps {
  page: any;
  isImported: boolean;
  isCurrentlyImporting: boolean;
  onImport: () => void;
  isImporting: boolean;
  selectedProject: string | null;
  renderIcon: (icon: any) => React.ReactNode;
}

const NotionPageCard: React.FC<NotionPageCardProps> = ({
  page,
  isImported,
  isCurrentlyImporting,
  onImport,
  isImporting,
  selectedProject,
  renderIcon
}) => {
  const lastEdited = new Date(page.last_edited).toLocaleDateString();
  
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center">
            {renderIcon(page.icon)}
            <h3 className="font-medium">{page.title}</h3>
          </div>
          
          <div className="mt-1 flex flex-wrap gap-2 items-center">
            <Badge variant="outline" className="text-xs capitalize">
              {page.parent?.type}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {page.parent?.name}
            </Badge>
            {page.workspace?.name && (
              <Badge variant="outline" className="text-xs bg-blue-50">
                {page.workspace.name}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              Last edited: {lastEdited}
            </span>
            {page.has_children && (
              <Badge variant="outline" className="text-xs bg-blue-50">
                Has nested content
              </Badge>
            )}
          </div>
          
          {isImported && (
            <span className="text-xs text-green-600 font-medium block mt-1">
              Imported
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(page.url, '_blank')}
            className="flex items-center"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View
          </Button>
          
          <Button 
            size="sm" 
            onClick={onImport}
            disabled={isImporting || !selectedProject || isImported}
          >
            {isCurrentlyImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : isImported ? "Imported" : "Import"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default NotionPageCard;
