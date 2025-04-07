
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/landing/FooterSection';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const NotionImport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [notionPages, setNotionPages] = useState([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [recentlyImported, setRecentlyImported] = useState<string[]>([]);

  // Check if user is connected to Notion
  useEffect(() => {
    const checkNotionConnection = async () => {
      if (!user) return;
      
      try {
        // Use query builder with explicit 'from' method to avoid type errors
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
        
        // Fetch user's projects - include both owned projects and projects where user is a member
        const { data: ownedProjects, error: ownedError } = await supabase
          .from('projects')
          .select('*')
          .eq('owner_id', user.id);
          
        if (ownedError) {
          console.error("Error fetching owned projects:", ownedError);
          toast.error("Failed to load projects");
        }
        
        // Fetch projects where user is a member
        const { data: memberProjects, error: memberError } = await supabase
          .from('project_members')
          .select('project_id, projects:project_id(*)')
          .eq('user_id', user.id);
          
        if (memberError) {
          console.error("Error fetching member projects:", memberError);
        }
        
        // Combine owned and member projects
        let allProjects = ownedProjects || [];
        
        // Add member projects (avoiding duplicates)
        if (memberProjects) {
          const memberProjectsData = memberProjects
            .filter(item => item.projects) // Filter out null projects
            .map(item => item.projects)
            .filter(project => !allProjects.some(p => p.id === project.id)); // Avoid duplicates
            
          allProjects = [...allProjects, ...memberProjectsData];
        }
        
        console.log("All user projects:", allProjects);
        setUserProjects(allProjects);
        
        // Then fetch Notion pages
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
      
      // Add this page to recently imported list
      setRecentlyImported(prev => [...prev, pageId]);
      
      // Show success message with a link to view the project
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

  // Placeholder component - this will be fleshed out with the actual Notion page list
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
    
    // This is a simple placeholder - the real implementation will display
    // actual pages from the Notion API
    return (
      <div className="space-y-2">
        {notionPages.map((page: any) => {
          const isImported = recentlyImported.includes(page.id);
          
          return (
            <Card key={page.id} className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-medium">{page.title}</h3>
                <p className="text-sm text-muted-foreground">{page.type}</p>
                {isImported && (
                  <span className="text-xs text-green-600 font-medium">
                    Imported
                  </span>
                )}
              </div>
              <Button 
                size="sm" 
                onClick={() => handleImportPage(page.id, page.title)}
                disabled={isImporting || !selectedProject || isImported}
              >
                {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : isImported ? "Imported" : "Import"}
              </Button>
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
        
        <div className="mb-4 flex justify-between items-center">
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
