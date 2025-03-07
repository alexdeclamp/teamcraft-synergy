
import React, { useState } from 'react';
import { File, MoreVertical, Download, Trash2, Eye, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import SummaryDialog from '@/components/summary/SummaryDialog';
import DocumentChatDialog from './DocumentChatDialog';

interface DocumentItemProps {
  document: {
    id: string;
    file_name: string;
    file_url: string;
    created_at: string;
    document_type?: string;
    file_size?: number;
    content_text?: string;
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState('');
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const fileExtension = document.file_name.split('.').pop()?.toLowerCase();
  const isPdf = fileExtension === 'pdf';
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  };

  const handleDownload = () => {
    if (document.file_url) {
      window.open(document.file_url, '_blank');
    } else {
      toast.error('Download link not available');
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete "${document.file_name}"?`);
    if (!confirmed) return;
    
    try {
      // Delete from database
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
  
  const handleGenerateSummary = async () => {
    if (!isPdf) {
      toast.error('Summary generation is only available for PDF files');
      return;
    }
    
    setIsGenerating(true);
    setSummary('');
    setIsSummaryOpen(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('summarize-pdf', {
        body: {
          pdfUrl: document.file_url,
          fileName: document.file_name,
          projectId
        }
      });
      
      if (error) throw error;
      
      if (!data.success || !data.summary) {
        throw new Error('Failed to generate summary');
      }
      
      setSummary(data.summary);
    } catch (error: any) {
      console.error('Error generating summary:', error);
      toast.error(`Failed to generate summary: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChatWithPdf = () => {
    if (!isPdf) {
      toast.error('Chat is only available for PDF files');
      return;
    }
    
    setIsChatOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border rounded-lg mb-2 bg-card">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-muted rounded-md">
            <File className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h4 className="font-medium">{document.file_name}</h4>
            <p className="text-sm text-muted-foreground">
              {formatDate(document.created_at)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isPdf && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={handleGenerateSummary}
                disabled={isGenerating}
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Summarize</span>
              </Button>
              
              <Button 
                variant="default" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={handleChatWithPdf}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="sm:inline">Chat with PDF</span>
              </Button>
            </>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <SummaryDialog
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        title={document.file_name}
        summary={summary}
        isLoading={isGenerating}
        projectId={projectId}
        imageName={document.file_name}
      />
      
      <DocumentChatDialog
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        document={document}
        projectId={projectId}
      />
    </>
  );
};

export default DocumentItem;
