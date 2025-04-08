
import React from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, Loader2, RefreshCw } from 'lucide-react';
import NotionPageCard from './NotionPageCard';

interface NotionPagesListProps {
  isLoading: boolean;
  isFiltering: boolean;
  notionPages: any[];
  recentlyImported: string[];
  importingPageId: string | null;
  isImporting: boolean;
  selectedProject: string | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  handleImportPage: (pageId: string, pageName: string) => Promise<void>;
  renderIcon: (icon: any) => React.ReactNode;
}

const NotionPagesList: React.FC<NotionPagesListProps> = ({
  isLoading,
  isFiltering,
  notionPages,
  recentlyImported,
  importingPageId,
  isImporting,
  selectedProject,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onClearFilters,
  onRefresh,
  handleImportPage,
  renderIcon
}) => {
  // Add extra logging for debugging purposes
  console.log("NotionPagesList rendered with:", { 
    notionPagesCount: notionPages.length,
    isLoading,
    isFiltering,
    hasData: Array.isArray(notionPages) && notionPages.length > 0 
  });

  if ((isLoading && !notionPages.length) || isFiltering) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }
  
  if (!notionPages.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No pages found that match your criteria
        </p>
        <div className="flex justify-center gap-3 mt-4">
          <Button variant="outline" onClick={onClearFilters}>
            Clear Filters
          </Button>
          <Button 
            variant="outline" 
            onClick={onRefresh} 
            className="flex items-center"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="space-y-2">
        {notionPages.map((page) => {
          const isImported = recentlyImported.includes(page.id);
          const isCurrentlyImporting = importingPageId === page.id;
          
          return (
            <NotionPageCard
              key={page.id}
              page={page}
              isImported={isImported}
              isCurrentlyImporting={isCurrentlyImporting}
              onImport={() => handleImportPage(page.id, page.title)}
              isImporting={isImporting}
              selectedProject={selectedProject}
              renderIcon={renderIcon}
            />
          );
        })}
      </div>
      
      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="flex items-center"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Load More
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );
};

export default NotionPagesList;
