
import React from 'react';
import { Eye, MessageSquare, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DocumentPdfActionsProps {
  onGenerateSummary: () => void;
  isGenerating: boolean;
}

const DocumentPdfActions: React.FC<DocumentPdfActionsProps> = ({
  onGenerateSummary,
  isGenerating
}) => {
  const handleChatWithPdf = () => {
    toast.info('Chat with PDF feature is coming soon!');
  };

  const handleAskQuestion = () => {
    toast.info('Ask Question feature is coming soon!');
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={onGenerateSummary}
        disabled={isGenerating}
      >
        <Eye className="h-4 w-4" />
        <span className="hidden sm:inline">Summarize</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1 opacity-70"
        onClick={handleAskQuestion}
      >
        <HelpCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Ask Question</span>
        <span className="hidden sm:inline text-xs ml-1">(Coming Soon)</span>
      </Button>
      
      <Button 
        variant="default" 
        size="sm" 
        className="flex items-center gap-1 opacity-70"
        onClick={handleChatWithPdf}
      >
        <MessageSquare className="h-4 w-4" />
        <span className="sm:inline">Chat</span>
        <span className="hidden sm:inline text-xs ml-1">(Coming Soon)</span>
      </Button>
    </>
  );
};

export default DocumentPdfActions;
