
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Loader2, 
  RefreshCw, 
  FileText, 
  Download, 
  Eye, 
  Clock, 
  MoreHorizontal,
  Star,
  AlertTriangle,
  Archive,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import ProjectDocumentUpload from './ProjectDocumentUpload';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";

interface Document {
  id: string;
  file_name: string;
  file_url: string;
  created_at: string;
  document_type: string;
  file_size?: number;
  is_favorite?: boolean;
  is_important?: boolean;
  is_archived?: boolean;
}

interface ProjectDocumentsProps {
  projectId: string;
}

const ProjectDocuments: React.FC<ProjectDocumentsProps> = ({ projectId }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

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
      filterDocuments(data as Document[], showArchived);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast.error(`Failed to load documents: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const filterDocuments = (docs: Document[], includeArchived: boolean) => {
    setFilteredDocs(docs.filter(doc => includeArchived || !doc.is_archived));
  };

  useEffect(() => {
    if (projectId) {
      fetchDocuments();
    }
  }, [projectId]);

  useEffect(() => {
    filterDocuments(documents, showArchived);
  }, [showArchived, documents]);

  const handleDocumentUploaded = (newDocument: Document) => {
    const updatedDocs = [newDocument, ...documents];
    setDocuments(updatedDocs);
    filterDocuments(updatedDocs, showArchived);
  };

  const toggleDocumentFlag = async (docId: string, flag: 'is_favorite' | 'is_important' | 'is_archived') => {
    try {
      const docToUpdate = documents.find(d => d.id === docId);
      if (!docToUpdate) return;
      
      const newValue = !docToUpdate[flag];
      
      const { error } = await supabase
        .from('project_documents')
        .update({ [flag]: newValue })
        .eq('id', docId);
        
      if (error) throw error;
      
      const updatedDocs = documents.map(doc => 
        doc.id === docId ? { ...doc, [flag]: newValue } : doc
      );
      
      setDocuments(updatedDocs);
      filterDocuments(updatedDocs, showArchived);
      
      let actionText = '';
      switch (flag) {
        case 'is_favorite':
          actionText = newValue ? 'added to favorites' : 'removed from favorites';
          break;
        case 'is_important':
          actionText = newValue ? 'marked as important' : 'unmarked as important';
          break;
        case 'is_archived':
          actionText = newValue ? 'archived' : 'unarchived';
          break;
      }
      
      toast.success(`Document ${actionText}`);
    } catch (error) {
      console.error(`Error updating document ${flag}:`, error);
      toast.error('Failed to update document');
    }
  };

  return (
    <div className="space-y-6">
      <ProjectDocumentUpload 
        projectId={projectId} 
        onDocumentUploaded={handleDocumentUploaded}
      />
      
      <div className="border rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-4 border-b bg-muted/40">
          <h3 className="font-medium text-lg">Uploaded Documents</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="showArchived" 
                checked={showArchived}
                onCheckedChange={(checked) => setShowArchived(checked as boolean)}
              />
              <label htmlFor="showArchived" className="text-sm cursor-pointer">
                Show Archived
              </label>
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
          </div>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No documents {!showArchived && "- Use the checkbox above to show archived documents"}</p>
              <p className="text-sm mt-1">Upload your first document above</p>
            </div>
          ) : (
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-2">
                {filteredDocs.map((doc) => (
                  <div 
                    key={doc.id} 
                    className={`flex items-center justify-between p-3 rounded-md 
                      ${doc.is_archived ? 'bg-muted/30' : 'bg-accent/30 hover:bg-accent/50'} 
                      transition-colors`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className={`h-5 w-5 flex-shrink-0 ${doc.is_archived ? 'text-muted-foreground' : 'text-primary/70'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium truncate ${doc.is_archived ? 'text-muted-foreground' : ''}`}>
                            {doc.file_name}
                          </p>
                          <div className="flex-shrink-0 flex gap-1">
                            {doc.is_favorite && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Star className="h-3.5 w-3.5 text-yellow-500" />
                                </TooltipTrigger>
                                <TooltipContent>Favorite</TooltipContent>
                              </Tooltip>
                            )}
                            {doc.is_important && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                                </TooltipTrigger>
                                <TooltipContent>Important</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-2">
                      <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                        <a href={doc.file_url} download={doc.file_name}>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggleDocumentFlag(doc.id, 'is_favorite')}>
                            <Star className={`mr-2 h-4 w-4 ${doc.is_favorite ? 'text-yellow-500' : ''}`} />
                            {doc.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleDocumentFlag(doc.id, 'is_important')}>
                            <AlertTriangle className={`mr-2 h-4 w-4 ${doc.is_important ? 'text-red-500' : ''}`} />
                            {doc.is_important ? 'Remove importance' : 'Mark as important'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => toggleDocumentFlag(doc.id, 'is_archived')}>
                            <Archive className="mr-2 h-4 w-4" />
                            {doc.is_archived ? 'Unarchive' : 'Archive'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDocuments;
