
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Document {
  id: string;
  file_name: string;
  file_url: string;
  created_at: string;
  document_type: string;
  file_size?: number;
}

export function useProjectDocuments(projectId: string) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDocuments = useCallback(async () => {
    if (!projectId) return;
    
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
  }, [projectId, isLoading]);

  useEffect(() => {
    if (projectId) {
      fetchDocuments();
    }
  }, [projectId, fetchDocuments]);

  const handleDocumentUploaded = (newDocument: Document) => {
    setDocuments(prev => [newDocument, ...prev]);
  };

  return {
    documents,
    isLoading,
    isRefreshing,
    fetchDocuments,
    handleDocumentUploaded
  };
}
