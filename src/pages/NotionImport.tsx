
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/landing/FooterSection';
import useNotionConnection from '@/hooks/useNotionConnection';
import useNotionProjects from '@/hooks/useNotionProjects';
import useNotionPages from '@/hooks/useNotionPages';
import useNotionDatabases from '@/hooks/useNotionDatabases';
import ProjectSelector from '@/components/notion-import/ProjectSelector';
import NotionPageFilters from '@/components/notion-import/NotionPageFilters';
import NotionPagesList from '@/components/notion-import/NotionPagesList';
import DatabaseSelector from '@/components/notion-import/DatabaseSelector';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const NotionImport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected, checkNotionConnection } = useNotionConnection();
  const [importMode, setImportMode] = useState<'databases' | 'pages'>('databases');
  const [isBatchImporting, setIsBatchImporting] = useState(false);
  
  const {
    userProjects,
    selectedProject,
    setSelectedProject,
    fetchUserProjects
  } = useNotionProjects();
  
  const {
    isLoading: isDatabasesLoading,
    databases,
    selectedDatabase,
    setSelectedDatabase,
    fetchDatabases,
    renderIcon: renderDatabaseIcon,
    error: databaseError
  } = useNotionDatabases();
  
  const {
    isLoading,
    isLoadingMore,
    isImporting,
    isFiltering,
    notionPages,
    recentlyImported,
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
  } = useNotionPages();
  
  useEffect(() => {
    if (isConnected) {
      console.log("Connection confirmed, fetching databases");
      fetchDatabases();
      fetchWorkspaces();
    }
  }, [isConnected]);

  useEffect(() => {
    if (selectedDatabase) {
      console.log("Database selected, fetching pages");
      fetchNotionPages(true, selectedDatabase);
      setImportMode('pages');
    }
  }, [selectedDatabase]);

  // Debug log to check data flow
  useEffect(() => {
    console.log("NotionImport component state:", { 
      notionPagesCount: notionPages?.length || 0,
      databasesCount: databases?.length || 0,
      selectedDatabase,
      importMode,
      isLoading, 
      isConnected,
      databaseError
    });
  }, [notionPages, databases, selectedDatabase, importMode, isLoading, isConnected, databaseError]);
  
  // Wrapper for the handleImportPage function that includes the selectedProject
  const handleImportPageWithProject = async (pageId: string, pageName: string) => {
    if (!selectedProject) {
      toast.error("Please select a project first");
      return;
    }
    
    await handleImportPage(pageId, pageName, selectedProject);
    fetchUserProjects(); // Refresh projects after import
    
    // Show toast with link to project
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
  };

  // Function to handle batch import
  const handleBatchImport = async (pageIds: string[]) => {
    if (!selectedProject) {
      toast.error("Please select a project first");
      return;
    }
    
    if (pageIds.length === 0) {
      toast.error("No pages selected");
      return;
    }
    
    if (!user) {
      toast.error("You must be logged in to import pages");
      return;
    }
    
    setIsBatchImporting(true);
    
    try {
      // Call the edge function with multiple page IDs
      const { data, error } = await supabase.functions.invoke('notion-import-page', {
        body: {
          userId: user.id, // Fixed: Use the actual user ID instead of a Promise
          pageIds: pageIds,
          projectId: selectedProject
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Update the recently imported list with all successfully imported pages
      const successfulImports = data.batchResults
        .filter((result: any) => result.success)
        .map((result: any) => result.pageId);
      
      // Add to recently imported list
      successfulImports.forEach((pageId: string) => {
        if (!recentlyImported.includes(pageId)) {
          recentlyImported.push(pageId);
        }
      });
      
      // Refresh projects after import
      fetchUserProjects();
      
      // Show success message
      const project = userProjects.find(p => p.id === selectedProject);
      
      toast.success(
        <div>
          <p>Imported {data.successCount} of {pageIds.length} pages successfully</p>
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
      
    } catch (error) {
      console.error("Error in batch import:", error);
      toast.error(`Failed to import pages: ${error.message || "Unknown error"}`);
    } finally {
      setIsBatchImporting(false);
    }
  };

  const handleDatabaseSelect = (databaseId: string) => {
    setSelectedDatabase(databaseId);
  };

  const handleBackToDatabase = () => {
    setImportMode('databases');
    setSelectedDatabase(null);
  };

  const handleRefreshDatabases = () => {
    fetchDatabases();
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
            Select a database or page from your Notion workspace to import as notes.
          </p>
        </div>
        
        <ProjectSelector 
          userProjects={userProjects}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
        />
        
        {importMode === 'databases' ? (
          <DatabaseSelector 
            databases={databases}
            isLoading={isDatabasesLoading}
            selectedDatabase={selectedDatabase}
            onSelectDatabase={handleDatabaseSelect}
            renderIcon={renderDatabaseIcon}
            error={databaseError}
            onRefresh={handleRefreshDatabases}
          />
        ) : (
          <>
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={handleBackToDatabase}
                className="flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Databases
              </Button>
            </div>
            
            <NotionPageFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterParentType={filterParentType}
              setFilterParentType={setFilterParentType}
              filterWorkspace={filterWorkspace}
              setFilterWorkspace={setFilterWorkspace}
              parentTypes={parentTypes}
              workspaces={workspaces}
              isLoading={isLoading}
              onRefresh={() => fetchNotionPages(true, selectedDatabase)}
              onClearFilters={clearFilters}
            />
            
            <NotionPagesList
              isLoading={isLoading}
              isFiltering={isFiltering}
              notionPages={notionPages}
              recentlyImported={recentlyImported}
              importingPageId={importingPageId}
              isImporting={isImporting || isBatchImporting}
              selectedProject={selectedProject}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={loadMorePages}
              onClearFilters={clearFilters}
              onRefresh={() => fetchNotionPages(true, selectedDatabase)}
              handleImportPage={handleImportPageWithProject}
              handleBatchImport={handleBatchImport}
              renderIcon={renderIcon}
            />
          </>
        )}
      </main>
      
      <FooterSection />
    </div>
  );
};

export default NotionImport;
