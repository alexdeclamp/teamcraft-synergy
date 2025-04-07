import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/landing/FooterSection';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ExternalLink, FileIcon, Loader2, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const NotionImport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [notionPages, setNotionPages] = useState([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [recentlyImported, setRecentlyImported] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);

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
        
        await fetchNotionPages();
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
  
  const fetchNotionPages = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('notion-list-pages', {
        body: { userId: user.id }
      });
      
      if (error) throw error;
      
      console.log("Notion pages:", data.pages);
      setNotionPages(data.pages || []);
    } catch (err: any) {
      console.error("Error fetching Notion pages:", err);
      toast.error(`Failed to fetch Notion pages: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImportPage = async (pageId: string, pageName: string) => {
    if (!user || !selectedProject) {
      toast.error("Please select a project first");
      return;
    }
    
    setIsImporting(true);
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
      
      toast.success(
        <div>
          <p>Imported "{pageName}" successfully</p>
          <Button 
            variant="link" 
            className="p-0 h-auto text-sm underline" 
            onClick={() => navigate(`/project/${selectedProject}`)}
          >
            View in Project
          </Button>
        </div>,
        { duration: 5000 }
      );
    } catch (err: any) {
      console.error("Error importing Notion page:", err);
      toast.error(`Failed to import page: ${err.message || 'Unknown error'}`);
    } finally {
      setIsImporting(false);
    }
  };

  const filteredPages = notionPages.filter((page: any) => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType ? page.parent.type === filterType : true;
    return matchesSearch && matchesFilter;
  });

  const parentTypes = [...new Set(notionPages.map((page: any) => page.parent.type))];

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
    if (isLoading) {
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
            onClick={fetchNotionPages} 
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
      <div className="space-y-2">
        {filteredPages.map((page: any) => {
          const isImported = recentlyImported.includes(page.id);
          const lastEdited = new Date(page.last_edited).toLocaleDateString();
          
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
                    {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : isImported ? "Imported" : "Import"}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
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
            Select pages from your Notion workspace to import as notes
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
            <h2 className="text-xl font-semibold">Your Notion Pages</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchNotionPages}
              disabled={isLoading}
              className="flex items-center"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Refresh
            </Button>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search pages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              />
            </div>
            
            <select
              className="p-2 border rounded-md bg-background"
              value={filterType || ''}
              onChange={(e) => setFilterType(e.target.value || null)}
            >
              <option value="">All types</option>
              {parentTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
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
