import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/landing/FooterSection';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import useNotionConnection from '@/hooks/useNotionConnection';
import NotionPagesList from '@/components/notion-import/NotionPagesList';
import ProjectSelector from '@/components/notion-import/ProjectSelector';
import DatabaseSelector from '@/components/notion-import/DatabaseSelector';

const NotionImport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isConnected } = useNotionConnection({ redirectIfNotConnected: true });
  
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  if (!isConnected) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container max-w-5xl mx-auto py-12 px-4 pt-32">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/integrations')}
            className="flex items-center text-muted-foreground mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Integrations
          </Button>
          
          <h1 className="text-3xl font-bold tracking-tight">Import from Notion</h1>
          <p className="text-muted-foreground mt-2">
            Import pages and databases from your connected Notion workspace
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <ProjectSelector 
              selectedProjectId={selectedProjectId}
              onProjectSelect={(projectId: string) => setSelectedProjectId(projectId)}
            />
          </div>
          <div>
            <NotionPagesList projectId={selectedProjectId} />
          </div>
          <div>
            <DatabaseSelector projectId={selectedProjectId} />
          </div>
        </div>
      </main>
      
      <FooterSection />
    </div>
  );
};

export default NotionImport;
