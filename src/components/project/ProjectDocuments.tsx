
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, RefreshCw, FileText, Download, Eye, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import ProjectDocumentUpload from './ProjectDocumentUpload';

interface Document {
  id: string;
  file_name: string;
  file_url: string;
  created_at: string;
  document_type: string;
  file_size?: number;
}

interface ProjectDocumentsProps {
  projectId: string;
}

const ProjectDocuments: React.FC<ProjectDocumentsProps> = ({ projectId }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDocuments = async () => {
    try {
      const isInitialLoad = isLoading;
      if (!isInitialLoad) setIsRefreshing(true);
      
      const { data, error } = await supabase
        .from('project_documents')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setDocuments(data as Document[]);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast.error(`Failed to load documents: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchDocuments();
    }
  }, [projectId]);

  const handleDocumentUploaded = (newDocument: Document) => {
    setDocuments(prev => [newDocument, ...prev]);
  };

  return (
    <div className="space-y-6">
      <ProjectDocumentUpload 
        projectId={projectId} 
        onDocumentUploaded={handleDocumentUploaded}
      />
      
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Project Documents</CardTitle>
            <CardDescription>
              Uploaded documents for this project
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchDocuments}
            disabled={isLoading || isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No documents uploaded yet</p>
              <p className="text-sm mt-1">Upload your first document above</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-md bg-accent/30 hover:bg-accent/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 flex-shrink-0 text-primary/70" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.file_name}</p>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={doc.file_url} download={doc.file_name}>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDocuments;
