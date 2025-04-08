
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileIcon } from 'lucide-react';

export const useNotionPages = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [notionPages, setNotionPages] = useState<any[]>([]);
  const [recentlyImported, setRecentlyImported] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterParentType, setFilterParentType] = useState<string | null>(null);
  const [filterWorkspace, setFilterWorkspace] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [importingPageId, setImportingPageId] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<string[]>([]);
  const [parentTypes, setParentTypes] = useState<string[]>([]);
  const [debounceTimeout, setDebounceTimeout] = useState<number | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);
  
  // Function to fetch workspaces
  const fetchWorkspaces = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('notion-list-workspaces', {
        body: { userId: user.id }
      });
      
      if (error) throw error;
      
      const workspaceNames: string[] = Array.isArray(data.workspaces) 
        ? data.workspaces.filter((name: unknown): name is string => typeof name === 'string')
        : [];
      
      setWorkspaces(workspaceNames);
      
    } catch (err) {
      console.error("Error fetching workspaces:", err);
      toast.error("Failed to load Notion workspaces");
    }
  };
  
  // Function to fetch Notion pages with filters
  const fetchNotionPages = useCallback(async (reset = true, databaseId: string | null = null) => {
    if (!user) return;
    
    if (reset) {
      setIsLoading(true);
      setNotionPages([]);
      setNextCursor(null);
    } else {
      setIsLoadingMore(true);
    }
    
    try {
      const cursor = reset ? null : nextCursor;
      
      const { data, error } = await supabase.functions.invoke('notion-list-pages', {
        body: { 
          userId: user.id,
          pageSize: 20,
          startCursor: cursor,
          workspaceFilter: filterWorkspace,
          parentTypeFilter: filterParentType,
          searchQuery: searchTerm,
          databaseId: databaseId
        }
      });
      
      if (error) throw error;
      
      // Log the raw response data for debugging
      console.log("Notion API response:", data);
      
      // Ensure data.pages is an array before setting state
      const pages = Array.isArray(data.pages) ? data.pages : [];
      console.log("Processed pages array:", pages);
      
      if (reset) {
        setNotionPages(pages);
      } else {
        setNotionPages(prev => [...prev, ...pages]);
      }
      
      setNextCursor(data.next_cursor);
      setHasMore(data.has_more);

      // Extract and set parent types safely using proper type assertions
      const extractedParentTypes: string[] = [];
      
      if (Array.isArray(pages)) {
        pages.forEach((page: any) => {
          if (typeof page.parent?.type === 'string' && page.parent.type.length > 0) {
            extractedParentTypes.push(page.parent.type);
          }
        });
      }
      
      setParentTypes([...new Set(extractedParentTypes)] as string[]);
      
      // Extract and set workspaces safely using proper type assertions
      const extractedWorkspaces: string[] = [];
      
      if (Array.isArray(pages)) {
        pages.forEach((page: any) => {
          if (typeof page.workspace?.name === 'string' && page.workspace.name.length > 0) {
            extractedWorkspaces.push(page.workspace.name);
          }
        });
      }
          
      setWorkspaces([...new Set(extractedWorkspaces)] as string[]);
      
      setIsFiltering(false);
      
      // Log page data for debugging
      console.log("Notion pages received:", pages.length);
      if (pages.length === 0) {
        console.log("No pages returned from Notion API");
      }
      
    } catch (err: any) {
      console.error("Error fetching Notion pages:", err);
      toast.error(`Failed to fetch Notion pages: ${err.message || 'Unknown error'}`);
      setIsFiltering(false);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [user, nextCursor, filterWorkspace, filterParentType, searchTerm]);
  
  // Function to handle loading more pages
  const loadMorePages = () => {
    if (hasMore && nextCursor) {
      fetchNotionPages(false);
    }
  };
  
  // Handle importing a page
  const handleImportPage = async (pageId: string, pageName: string, projectId: string) => {
    if (!user) {
      toast.error("You must be logged in to import pages");
      return false;
    }
    
    setIsImporting(true);
    setImportingPageId(pageId);
    
    try {
      console.log(`Importing Notion page: ${pageId} to project: ${projectId}`);
      
      const { data, error } = await supabase.functions.invoke('notion-import-page', {
        body: { 
          userId: user.id, 
          pageId, 
          projectId 
        }
      });
      
      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || "Unknown error during import");
      }
      
      // Add the imported page ID to the recently imported list
      setRecentlyImported(prev => [...prev, pageId]);
      
      toast.success(`Imported "${pageName}" successfully`);
      console.log(`Successfully imported Notion page: ${pageName}`);
      
      return true;
    } catch (err: any) {
      console.error("Error importing Notion page:", err);
      toast.error(`Failed to import page: ${err.message || 'Unknown error'}`);
      return false;
    } finally {
      setIsImporting(false);
      setImportingPageId(null);
    }
  };
  
  // Function to clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterParentType(null);
    setFilterWorkspace(null);
    fetchNotionPages();
  };
  
  // Function to render icon
  const renderIcon = (icon: any) => {
    if (!icon) return <FileIcon className="h-4 w-4 mr-1" />;
    
    if (typeof icon === 'string') {
      if (icon.length <= 2) {
        return <span className="mr-2">{icon}</span>;
      } else {
        return <img src={icon} alt="icon" className="h-4 w-4 mr-2 object-contain" />;
      }
    }
    
    return <FileIcon className="h-4 w-4 mr-1" />;
  };
  
  // Set up the debounce for search and filters
  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    if (user && (searchTerm || filterParentType || filterWorkspace)) {
      setIsFiltering(true);
      const timeout = setTimeout(() => {
        fetchNotionPages();
      }, 500);
      
      setDebounceTimeout(timeout as unknown as number);
    }

    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [searchTerm, filterParentType, filterWorkspace, user, fetchNotionPages]);
  
  return {
    isLoading,
    isLoadingMore,
    isImporting,
    isFiltering,
    notionPages,
    recentlyImported,
    setRecentlyImported, // Make sure to expose this function in the return object
    searchTerm,
    setSearchTerm,
    filterParentType,
    setFilterParentType,
    filterWorkspace,
    setFilterWorkspace,
    nextCursor,
    hasMore,
    importingPageId,
    workspaces,
    parentTypes,
    fetchWorkspaces,
    fetchNotionPages,
    loadMorePages,
    handleImportPage,
    clearFilters,
    renderIcon
  };
};

export default useNotionPages;
