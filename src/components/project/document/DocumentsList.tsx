
import React, { useState } from 'react';
import { Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
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
  const { isProcessing, progress, summarizeDocuments } = useBatchSummarize({ 
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
    await summarizeDocuments(selectedDocuments);
    setSelectedDocs([]);
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
            </>
          )}
        </div>
      </div>
      
      {isProcessing && (
        <div className="mb-4">
          <Progress value={progress} className="h-2 mb-1" />
          <p className="text-xs text-muted-foreground text-center">
            Generating summaries and creating notes... {progress}%
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
    </div>
  );
};
