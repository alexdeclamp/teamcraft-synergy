
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileIcon,
  FolderIcon,
  HomeIcon,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from '@/components/ui/select';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

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
  const [filterType, setFilterType] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [importingPageId, setImportingPageId] = useState<string | null>(null);
  
  // New state for workspace navigation
  const [viewMode, setViewMode] = useState<'workspaces' | 'pages'>('workspaces');
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [currentParent, setCurrentParent] = useState<any>(null);
  const [navigationPath, setNavigationPath] = useState<any[]>([]);
  const [currentItems, setCurrentItems] = useState<any[]>([]);

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
      } finally {
        setIsLoading(false);
      }
    };
    
    checkNotionConnection();
  }, [user, navigate]);
  
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
      
      console.log("All user projects:", allProjects);
      setUserProjects(allProjects);
      
      // If there's only one project, auto-select it
      if (allProjects.length === 1 && !selectedProject) {
        setSelectedProject(allProjects[0].id);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      toast.error("Failed to load projects");
    }
  };
  
  const fetchWorkspaces = async () => {
    if (!user) return;
    
    setIsLoadingWorkspaces(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('notion-list-pages', {
        body: { 
          userId: user.id,
          mode: 'workspaces'
        }
      });
      
      if (error) throw error;
      
      console.log("Notion workspaces:", data.workspaces);
      setWorkspaces(data.workspaces || []);
      setCurrentItems(data.workspaces || []);
    } catch (err: any) {
      console.error("Error fetching Notion workspaces:", err);
      toast.error(`Failed to fetch Notion workspaces: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoadingWorkspaces(false);
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
          pageSize: 30,
          startCursor: cursor
        }
      });
      
      if (error) throw error;
      
      console.log("Notion pages:", data.pages);
      
      if (reset) {
        setNotionPages(data.pages || []);
      } else {
        setNotionPages(prev => [...prev, ...(data.pages || [])]);
      }
      
      setNextCursor(data.next_cursor);
      setHasMore(data.has_more);
    } catch (err: any) {
      console.error("Error fetching Notion pages:", err);
      toast.error(`Failed to fetch Notion pages: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };
  
  const fetchParentItems = async (parentId: string, parentItem: any) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('notion-list-pages', {
        body: { 
          userId: user.id,
          mode: 'parent',
          parentId: parentId
        }
      });
      
      if (error) throw error;
      
      console.log("Parent items:", data);
      
      // Add this parent to the navigation path
      setNavigationPath(prev => [...prev, parentItem]);
      setCurrentParent(parentItem);
      
      if (data.children) {
        setCurrentItems(data.children);
      } else if (data.items) {
        setCurrentItems(data.items);
      } else {
        setCurrentItems([]);
      }
    } catch (err: any) {
      console.error("Error fetching parent items:", err);
      toast.error(`Failed to fetch items: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const goBack = () => {
    if (navigationPath.length <= 1) {
      // Go back to workspaces
      setNavigationPath([]);
      setCurrentParent(null);
      setCurrentItems(workspaces);
    } else {
      // Go back one level
      const newPath = [...navigationPath];
      newPath.pop(); // Remove current
      const parentToNavigate = newPath[newPath.length - 1];
      newPath.pop(); // Remove parent we'll navigate to
      
      setNavigationPath(newPath);
      fetchParentItems(parentToNavigate.id, parentToNavigate);
    }
  };
  
  const navigateToRoot = () => {
    setNavigationPath([]);
    setCurrentParent(null);
    setCurrentItems(workspaces);
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
      
      // Get the project details for a more helpful message
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
      
      // Refresh projects to update any counters
      fetchUserProjects();
    } catch (err: any) {
      console.error("Error importing Notion page:", err);
      toast.error(`Failed to import page: ${err.message || 'Unknown error'}`);
    } finally {
      setIsImporting(false);
      setImportingPageId(null);
    }
  };

  const filteredPages = notionPages.filter((page: any) => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType ? page.parent.type === filterType : true;
    return matchesSearch && matchesFilter;
  });

  const filteredItems = currentItems.filter((item: any) => {
    return item.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const parentTypes = [...new Set(notionPages.map((page: any) => page.parent.type))];

  const renderIcon = (icon: any, type = 'page') => {
    if (!icon) {
      return type === 'database' ? 
        <FolderIcon className="h-4 w-4 mr-1" /> : 
        <FileIcon className="h-4 w-4 mr-1" />;
    }
    
    if (typeof icon === 'string') {
      if (icon.length <= 2) {
        return <span className="mr-2">{icon}</span>;
      } else {
        return <img src={icon} alt="icon" className="h-4 w-4 mr-2 object-contain" />;
      }
    }
    
    return type === 'database' ? 
      <FolderIcon className="h-4 w-4 mr-1" /> : 
      <FileIcon className="h-4 w-4 mr-1" />;
  };

  const WorkspaceView = () => {
    if (isLoadingWorkspaces && workspaces.length === 0) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      );
    }
    
    if (isLoading && navigationPath.length > 0) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      );
    }
    
    if (!currentItems.length) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No items found in this location</p>
          {navigationPath.length > 0 && (
            <Button 
              variant="outline" 
              onClick={goBack} 
              className="mt-4 flex items-center"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          )}
        </div>
      );
    }
    
    if (filteredItems.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No items match your search</p>
          <Button 
            variant="outline" 
            onClick={() => setSearchTerm('')} 
            className="mt-4"
          >
            Clear Search
          </Button>
        </div>
      );
    }
    
    return (
      <>
        {navigationPath.length > 0 && (
          <div className="flex items-center mb-4 space-x-2 overflow-x-auto whitespace-nowrap py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateToRoot}
              className="flex items-center"
            >
              <HomeIcon className="h-4 w-4 mr-1" />
              Root
            </Button>
            
            {navigationPath.map((item, index) => (
              <React.Fragment key={item.id}>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center"
                  onClick={() => {
                    // Navigate to this level
                    const newPath = navigationPath.slice(0, index);
                    setNavigationPath(newPath);
                    fetchParentItems(item.id, item);
                  }}
                >
                  {renderIcon(item.icon, item.type)}
                  <span className="truncate max-w-[150px]">{item.title}</span>
                </Button>
              </React.Fragment>
            ))}
          </div>
        )}
      
        <div className="space-y-2">
          {filteredItems.map((item: any) => {
            const isImported = recentlyImported.includes(item.id);
            const lastEdited = item.last_edited ? new Date(item.last_edited).toLocaleDateString() : null;
            const isCurrentlyImporting = importingPageId === item.id;
            
            return (
              <Card key={item.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center">
                      {renderIcon(item.icon, item.type)}
                      <h3 className="font-medium">{item.title}</h3>
                    </div>
                    
                    {lastEdited && (
                      <div className="mt-1">
                        <span className="text-xs text-muted-foreground">
                          Last edited: {lastEdited}
                        </span>
                      </div>
                    )}
                    
                    <div className="mt-1 flex flex-wrap gap-2 items-center">
                      <Badge variant="outline" className="text-xs capitalize">
                        {item.type}
                      </Badge>
                      
                      {item.has_children && (
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
                    {item.has_children && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fetchParentItems(item.id, item)}
                      >
                        Browse Content
                      </Button>
                    )}
                    
                    {item.url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(item.url, '_blank')}
                        className="flex items-center"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    )}
                    
                    {item.type === 'page' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleImportPage(item.id, item.title)}
                        disabled={isImporting || !selectedProject || isImported}
                      >
                        {isCurrentlyImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : isImported ? "Imported" : "Import"}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </>
    );
  };

  const PagesListView = () => {
    if (isLoading && !notionPages.length) {
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
          <p className="text-muted-foreground">No pages found in your Notion workspace</p>
          <Button 
            variant="outline" 
            onClick={() => fetchNotionPages()} 
            className="mt-4 flex items-center"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      );
    }
    
    if (filteredPages.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No pages match your search or filter</p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setFilterType(null);
            }} 
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      );
    }
    
    return (
      <>
        <div className="space-y-2">
          {filteredPages.map((page: any) => {
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
                        {page.parent.type}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {page.parent.name}
                      </Badge>
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
        
        {viewMode === 'pages' && hasMore && (
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
            Browse your Notion content and import pages as notes. Nested content like toggles and dropdowns will be included.
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
            <h2 className="text-xl font-semibold">Notion Content</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  if (viewMode === 'workspaces') {
                    fetchWorkspaces();
                  } else {
                    fetchNotionPages();
                  }
                }}
                disabled={isLoading}
                className="flex items-center"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Refresh
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="workspaces" onValueChange={(value) => setViewMode(value as 'workspaces' | 'pages')}>
            <TabsList className="mb-4">
              <TabsTrigger value="workspaces">Browse Workspaces</TabsTrigger>
              <TabsTrigger value="pages">All Pages</TabsTrigger>
            </TabsList>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              />
            </div>
            
            {viewMode === 'pages' && (
              <div className="mb-4">
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={filterType || ''}
                  onChange={(e) => setFilterType(e.target.value || null)}
                >
                  <option value="">All parent types</option>
                  {parentTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <TabsContent value="workspaces">
              <WorkspaceView />
            </TabsContent>
            
            <TabsContent value="pages">
              <PagesListView />
            </TabsContent>
          </Tabs>
        </div>
        
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
