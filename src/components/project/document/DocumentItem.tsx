
import React from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import DocumentActions from './DocumentActions';
import DocumentPdfActions from './DocumentPdfActions';
import DocumentItemHeader from './DocumentItemHeader';
import useDocumentSummary from './DocumentSummaryHandler';

interface DocumentItemProps {
  document: {
    id: string;
    file_name: string;
    file_url: string;
    created_at: string;
    document_type?: string;
    file_size?: number;
    content_text?: string;
    metadata?: {
      pdf_url?: string;
    };
  };
  onDelete?: (id: string) => void;
  onRefresh?: () => void;
  projectId: string;
}

const DocumentItem: React.FC<DocumentItemProps> = ({ 
  document, 
  onDelete, 
  onRefresh,
  projectId
}) => {
  const fileExtension = document.file_name.split('.').pop()?.toLowerCase();
  const isPdf = fileExtension === 'pdf';
  const pdfUrl = document.metadata?.pdf_url || document.file_url;
  
  const {
    SummaryDialogComponent
  } = useDocumentSummary({
    fileName: document.file_name,
    fileUrl: pdfUrl,
    isPdf,
    projectId
  });

  const handleDelete = async () => {
    if (!onDelete) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete "${document.file_name}"?`);
    if (!confirmed) return;
    
    try {
      const { error } = await supabase
        .from('project_documents')
        .delete()
        .eq('id', document.id);
      
      if (error) throw error;
      
      toast.success(`"${document.file_name}" deleted successfully`);
      onDelete(document.id);
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(`Failed to delete document: ${error.message}`);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg mb-2 bg-card w-full gap-3">
        <DocumentItemHeader
          fileName={document.file_name}
          createdAt={document.created_at}
        />
        
        <div className="flex items-center justify-end gap-2 ml-auto mt-2 sm:mt-0">
          {isPdf && (
            <DocumentPdfActions
              pdfUrl={pdfUrl}
              fileName={document.file_name}
              projectId={projectId}
            />
          )}
          
          <DocumentActions
            fileName={document.file_name}
            fileUrl={document.file_url}
            onDelete={handleDelete}
          />
        </div>
      </div>
      
      <SummaryDialogComponent />
    </>
  );
};

export default DocumentItem;
