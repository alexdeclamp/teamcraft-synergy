
import React from 'react';
import { Loader2, Database, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { NotionDatabase } from '@/hooks/useNotionDatabases';

interface DatabaseSelectorProps {
  databases: NotionDatabase[];
  isLoading: boolean;
  selectedDatabase: string | null;
  onSelectDatabase: (databaseId: string) => void;
  renderIcon: (icon: string | null) => React.ReactNode;
}

const DatabaseSelector: React.FC<DatabaseSelectorProps> = ({
  databases,
  isLoading,
  selectedDatabase,
  onSelectDatabase,
  renderIcon
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Select a Database</h2>
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (!databases.length) {
    return (
      <div className="text-center py-8 border rounded-md">
        <Database className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No Databases Found</h3>
        <p className="text-muted-foreground mt-2">
          We couldn't find any databases in your Notion workspace
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select a Database</h2>
      <div className="space-y-2">
        {databases.map((database) => (
          <Card
            key={database.id}
            className={`p-4 cursor-pointer hover:bg-accent/50 transition-colors ${
              selectedDatabase === database.id ? 'bg-accent/60 border-primary' : ''
            }`}
            onClick={() => onSelectDatabase(database.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {renderIcon(database.icon)}
                <div>
                  <div className="font-medium">{database.title}</div>
                  <div className="text-sm text-muted-foreground">
                    Last edited: {new Date(database.last_edited_time).toLocaleString()}
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DatabaseSelector;
