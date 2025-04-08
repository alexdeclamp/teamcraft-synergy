
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/landing/FooterSection';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft, 
  ChevronDown, 
  ExternalLink, 
  FileIcon, 
  Loader2, 
  RefreshCw,
  Filter,
  Search,
  X
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NotionImport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [notionPages, setNotionPages] = useState([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [userProjects, setUserProjects] = useState<any[]>([]);
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

  useEffect(() => {
    const checkNotionConnection = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('notion_connections')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (!data || error) {
          toast.error("You need to connect to Notion first");
          navigate('/notion-connect');
          return;
        }
        
        await fetchUserProjects();
        await fetchWorkspaces();
      } catch (err) {
        console.error("Error checking Notion connection:", err);
        toast.error("Failed to verify Notion connection");
        navigate('/notion-connect');
      }
    };
    
    checkNotionConnection();
  }, [user, navigate]);

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
      
      await fetchNotionPages();
      
    } catch (err) {
      console.error("Error fetching workspaces:", err);
      toast.error("Failed to load Notion workspaces");
      await fetchNotionPages();
    }
  };

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
  }, [searchTerm, filterParentType, filterWorkspace]);
  
  const fetchUserProjects = async () => {
    if (!user) return;
    
    try {
      const { data: ownedProjects, error: ownedError } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user.id);
        
      if (ownedError) {
        console.error("Error fetching owned projects:", ownedError);
        toast.error("Failed to load projects");
      }
      
      const { data: memberProjects, error: memberError } = await supabase
        .from('project_members')
        .select('project_id, projects:project_id(*)')
        .eq('user_id', user.id);
        
      if (memberError) {
        console.error("Error fetching member projects:", memberError);
      }
      
      let allProjects = ownedProjects || [];
      
      if (memberProjects) {
        const memberProjectsData = memberProjects
          .filter(item => item.projects)
          .map(item => item.projects)
          .filter(project => !allProjects.some(p => p.id === project.id));
          
        allProjects = [...allProjects, ...memberProjectsData];
      }
      
      setUserProjects(allProjects);
      
      if (allProjects.length === 1 && !selectedProject) {
        setSelectedProject(allProjects[0].id);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      toast.error("Failed to load projects");
    }
  };
  
  const fetchNotionPages = async (reset = true) => {
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
          searchQuery: searchTerm
        }
      });
      
      if (error) throw error;
      
      if (reset) {
        setNotionPages(data.pages || []);
      } else {
        setNotionPages(prev => [...prev, ...(data.pages || [])]);
      }
      
      setNextCursor(data.next_cursor);
      setHasMore(data.has_more);

      // Extract and set parent types safely using proper type assertions
      const extractedParentTypes: string[] = [];
      
      if (Array.isArray(data.pages)) {
        data.pages.forEach((page: any) => {
          if (typeof page.parent?.type === 'string' && page.parent.type.length > 0) {
            extractedParentTypes.push(page.parent.type);
          }
        });
      }
      
      setParentTypes([...new Set(extractedParentTypes)]);
      
      // Extract and set workspaces safely using proper type assertions
      const extractedWorkspaces: string[] = [];
      
      if (Array.isArray(data.pages)) {
        data.pages.forEach((page: any) => {
          if (typeof page.workspace?.name === 'string' && page.workspace.name.length > 0) {
            extractedWorkspaces.push(page.workspace.name);
          }
        });
      }
          
      setWorkspaces([...new Set(extractedWorkspaces)]);
      
      setIsFiltering(false);
      
      // Log page data for debugging
      console.log("Notion pages received:", data.pages ? data.pages.length : 0);
      if (data.pages && data.pages.length === 0) {
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
  };
  
  const loadMorePages = () => {
    if (hasMore && nextCursor) {
      fetchNotionPages(false);
    }
  };
  
  const handleImportPage = async (pageId: string, pageName: string) => {
    if (!user || !selectedProject) {
      toast.error("Please select a project first");
      return;
    }
    
    setIsImporting(true);
    setImportingPageId(pageId);
    
    try {
      const { data, error } = await supabase.functions.invoke('notion-import-page', {
        body: { 
          userId: user.id, 
          pageId, 
          projectId: selectedProject 
        }
      });
      
      if (error) throw error;
      
      setRecentlyImported(prev => [...prev, pageId]);
      
      const project = userProjects.find(p => p.id === selectedProject);
      
      toast.success(
        <div>
          <p>Imported "{pageName}" successfully</p>
          <Button 
            variant="link" 
            className="p-0 h-auto text-sm underline" 
            onClick={() => navigate(`/project/${selectedProject}`)}
          >
            View in Project: {project?.title || 'View Project'}
          </Button>
        </div>,
        { duration: 5000 }
      );
      
      fetchUserProjects();
    } catch (err: any) {
      console.error("Error importing Notion page:", err);
      toast.error(`Failed to import page: ${err.message || 'Unknown error'}`);
    } finally {
      setIsImporting(false);
      setImportingPageId(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterParentType(null);
    setFilterWorkspace(null);
    fetchNotionPages();
  };

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

  const NotionPagesList = () => {
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
            {searchTerm || filterParentType || filterWorkspace 
              ? "No pages match your search or filters" 
              : "No pages found in your Notion workspace"}
          </p>
          <div className="flex justify-center gap-3 mt-4">
            {(searchTerm || filterParentType || filterWorkspace) && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => fetchNotionPages()} 
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
          {notionPages.map((page: any, index: number) => {
            const isImported = recentlyImported.includes(page.id);
            const lastEdited = new Date(page.last_edited).toLocaleDateString();
            const isCurrentlyImporting = importingPageId === page.id;
            
            return (
              <Card key={page.id} className="p-4">
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
                      onClick={() => handleImportPage(page.id, page.title)}
                      disabled={isImporting || !selectedProject || isImported}
                    >
                      {isCurrentlyImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : isImported ? "Imported" : "Import"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        
        {hasMore && (
          <div className="flex justify-center mt-6">
            <Button
              variant="outline"
              onClick={loadMorePages}
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container max-w-4xl mx-auto py-12 px-4">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/notion-connect')}
            className="flex items-center text-muted-foreground mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Connection
          </Button>
          
          <h1 className="text-3xl font-bold tracking-tight">Import from Notion</h1>
          <p className="text-muted-foreground mt-2">
            Select pages from your Notion workspace to import as notes. Nested content like toggles and dropdowns will be included.
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Select Project
          </label>
          <select 
            className="w-full p-2 border rounded-md bg-background"
            value={selectedProject || ''}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="">-- Select a project --</option>
            {userProjects.map(project => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
          {!selectedProject && (
            <p className="text-sm text-amber-600 mt-1">
              Please select a project to import notes into
            </p>
          )}
          {userProjects.length === 0 && (
            <p className="text-sm text-red-500 mt-1">
              No projects found. Please create a project first from the dashboard.
            </p>
          )}
        </div>
        
        <div className="mb-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Notion Pages</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchNotionPages()}
              disabled={isLoading}
              className="flex items-center"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Refresh
            </Button>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="w-full relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search pages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border rounded-md bg-background"
              />
              {searchTerm && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0" 
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex gap-4 flex-wrap">
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium mb-2">
                  Filter by Type
                </label>
                <Select
                  value={filterParentType || "all_types"}
                  onValueChange={(value) => setFilterParentType(value === "all_types" ? null : value)}
                >
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_types">All types</SelectItem>
                    {parentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {workspaces.length > 0 && (
                <div className="w-full md:w-auto">
                  <label className="block text-sm font-medium mb-2">
                    Filter by Workspace
                  </label>
                  <Select
                    value={filterWorkspace || "all_workspaces"}
                    onValueChange={(value) => setFilterWorkspace(value === "all_workspaces" ? null : value)}
                  >
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="All workspaces" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_workspaces">All workspaces</SelectItem>
                      {workspaces.map((workspace) => (
                        <SelectItem key={workspace} value={workspace}>
                          {workspace}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            {(searchTerm || filterParentType || filterWorkspace) && (
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-sm"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <NotionPagesList />
        
        {userProjects.length === 0 && (
          <div className="mt-8 p-4 border border-amber-200 bg-amber-50 rounded-md">
            <h3 className="text-amber-800 font-medium">No Projects Available</h3>
            <p className="text-amber-700 mt-1">
              You need to create a project first before you can import Notion pages.
            </p>
            <Button 
              variant="default" 
              onClick={() => navigate('/dashboard')}
              className="mt-3"
            >
              Go to Dashboard
            </Button>
          </div>
        )}
      </main>
      
      <FooterSection />
    </div>
  );
};

export default NotionImport;
