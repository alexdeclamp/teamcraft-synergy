
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, Loader2, RefreshCw, Check } from 'lucide-react';
import NotionPageCard from './NotionPageCard';
import { Checkbox } from '@/components/ui/checkbox';

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
  handleBatchImport?: (pageIds: string[]) => Promise<void>;
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
  handleBatchImport,
  renderIcon
}) => {
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [isBatchImporting, setIsBatchImporting] = useState(false);
  
  // Toggle page selection for batch import
  const togglePageSelection = (pageId: string) => {
    setSelectedPages(prev => 
      prev.includes(pageId) 
        ? prev.filter(id => id !== pageId) 
        : [...prev, pageId]
    );
  };
  
  // Handle batch import
  const onBatchImport = async () => {
    if (!handleBatchImport || selectedPages.length === 0 || !selectedProject) return;
    
    setIsBatchImporting(true);
    try {
      await handleBatchImport(selectedPages);
      setSelectedPages([]);
    } catch (error) {
      console.error("Error during batch import:", error);
    } finally {
      setIsBatchImporting(false);
    }
  };
  
  // Select all visible pages
  const selectAllPages = () => {
    const allPageIds = notionPages
      .filter(page => !recentlyImported.includes(page.id))
      .map(page => page.id);
    setSelectedPages(allPageIds);
  };
  
  // Clear all selections
  const clearSelections = () => {
    setSelectedPages([]);
  };
  
  // Add extra logging for debugging purposes
  console.log("NotionPagesList rendered with:", { 
    notionPagesCount: notionPages.length,
    isLoading,
    isFiltering,
    hasData: Array.isArray(notionPages) && notionPages.length > 0,
    selectedPages
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
  
  // Count pages that can be selected (not already imported)
  const selectablePageCount = notionPages.filter(page => !recentlyImported.includes(page.id)).length;
  
  return (
    <>
      {handleBatchImport && selectablePageCount > 0 && (
        <div className="bg-muted/30 p-4 rounded-md mb-4 border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {selectedPages.length} of {selectablePageCount} pages selected
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={selectAllPages}
                  disabled={selectablePageCount === 0 || selectablePageCount === selectedPages.length}
                >
                  Select all
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearSelections}
                  disabled={selectedPages.length === 0}
                >
                  Clear
                </Button>
              </div>
            </div>
            <Button 
              onClick={onBatchImport} 
              disabled={selectedPages.length === 0 || isBatchImporting || !selectedProject}
              className="whitespace-nowrap"
            >
              {isBatchImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing {selectedPages.length} pages...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Import {selectedPages.length} selected pages
                </>
              )}
            </Button>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        {notionPages.map((page) => {
          const isImported = recentlyImported.includes(page.id);
          const isCurrentlyImporting = importingPageId === page.id;
          const isSelected = selectedPages.includes(page.id);
          
          return (
            <NotionPageCard
              key={page.id}
              page={page}
              isImported={isImported}
              isCurrentlyImporting={isCurrentlyImporting}
              isSelected={isSelected}
              onToggleSelect={() => togglePageSelection(page.id)}
              onImport={() => handleImportPage(page.id, page.title)}
              isImporting={isImporting}
              selectedProject={selectedProject}
              renderIcon={renderIcon}
              showCheckbox={!!handleBatchImport}
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
