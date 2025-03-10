
import React, { useState } from 'react';
import { Loader2, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DocumentItem from './DocumentItem';
import { useBatchSummarize } from '@/hooks/useBatchSummarize';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

interface DocumentsListProps {
  documents: any[];
  isLoading: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  projectId: string;
}

export const DocumentsList: React.FC<DocumentsListProps> = ({
  documents,
  isLoading,
  isRefreshing = false,
  onRefresh,
  projectId
}) => {
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [aiModel, setAiModel] = useState<'claude' | 'openai'>('claude');
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const { isProcessing, progress, results, errors, summarizeDocuments } = useBatchSummarize({ 
    projectId,
    model: aiModel
  });

  const handleDocumentSelect = (docId: string) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId) 
        : [...prev, docId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocs.length === documents.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(documents.map(doc => doc.id));
    }
  };

  const handleGenerateSummaries = async () => {
    const selectedDocuments = documents.filter(doc => selectedDocs.includes(doc.id));
    
    // Warn the user if they're trying to process too many documents at once
    if (selectedDocuments.length > 10) {
      const confirmed = confirm(
        `You are about to process ${selectedDocuments.length} documents, which might take a while ` +
        `and could cause some documents to fail. It's recommended to process 10 or fewer documents at once. ` +
        `Do you want to continue anyway?`
      );
      
      if (!confirmed) return;
    }
    
    await summarizeDocuments(selectedDocuments);
    // Don't clear selected docs immediately in case user wants to retry failed ones
    if (errors?.length === 0) {
      setSelectedDocs([]);
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No documents have been uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Checkbox 
            id="select-all" 
            checked={selectedDocs.length > 0 && selectedDocs.length === documents.length} 
            onCheckedChange={handleSelectAll}
            className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          />
          <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
            {selectedDocs.length === 0 ? 'Select All' : 
             selectedDocs.length === documents.length ? 'Deselect All' : 
             `${selectedDocs.length} selected`}
          </label>
        </div>
        
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh} 
              disabled={isRefreshing}
              className="h-8"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
          
          {errors?.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowErrorDialog(true)}
              className="h-8 text-destructive border-destructive hover:bg-destructive/10"
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              View Errors ({errors.length})
            </Button>
          )}
          
          {selectedDocs.length > 0 && (
            <>
              <Select value={aiModel} onValueChange={(value: 'claude' | 'openai') => setAiModel(value)}>
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue placeholder="AI Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claude">Claude</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                </SelectContent>
              </Select>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div> {/* Wrapper div to make disabled button work with tooltip */}
                      <Button 
                        variant="default" 
                        size="sm" 
                        disabled={isProcessing} 
                        onClick={handleGenerateSummaries}
                        className="h-8"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Summarize Selected
                          </>
                        )}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Generate summaries and save them as notes</p>
                    {selectedDocs.length > 10 && (
                      <p className="text-yellow-500 text-xs mt-1">
                        Processing many documents at once may cause failures
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      </div>
      
      {isProcessing && (
        <div className="mb-4">
          <Progress value={progress} className="h-2 mb-1" />
          <p className="text-xs text-muted-foreground text-center">
            {progress < 20 && "Preparing documents..."}
            {progress >= 20 && progress < 70 && "Generating summaries..."}
            {progress >= 70 && progress < 90 && "Creating notes..."}
            {progress >= 90 && "Finalizing..."}
            {" "}{progress}%
          </p>
        </div>
      )}
      
      <div className="space-y-2">
        {documents.map((document) => (
          <div key={document.id} className="flex items-center gap-2">
            <Checkbox 
              id={`doc-${document.id}`}
              checked={selectedDocs.includes(document.id)}
              onCheckedChange={() => handleDocumentSelect(document.id)}
              className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground ml-1"
            />
            <div className="flex-grow">
              <DocumentItem 
                document={document} 
                onDelete={onRefresh} 
                onRefresh={onRefresh}
                projectId={projectId}
              />
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Document Processing Errors
            </DialogTitle>
            <DialogDescription>
              The following documents could not be processed successfully:
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto">
            <ul className="space-y-2">
              {errors?.map((error, index) => (
                <li key={index} className="border rounded-md p-3">
                  <div className="font-medium">{error.fileName}</div>
                  <div className="text-sm text-muted-foreground">Error: {error.error}</div>
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                // Mark only the failed documents for retry
                const failedDocIds = errors
                  .map(err => documents.find(doc => doc.file_name === err.fileName)?.id)
                  .filter(Boolean) as string[];
                setSelectedDocs(failedDocIds);
                setShowErrorDialog(false);
                toast.info(`Selected ${failedDocIds.length} failed document(s) for retry`);
              }}
            >
              Select Failed for Retry
            </Button>
            <Button onClick={() => setShowErrorDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
