
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, MessageSquareText } from "lucide-react";
import { toast } from 'sonner';
import DocumentQuestionDialog from './DocumentQuestionDialog';

interface DocumentPdfActionsProps {
  documentId: string;
  documentText: string;
  documentName: string;
  documentUrl?: string;
  onSummarize: () => void;
}

const DocumentPdfActions: React.FC<DocumentPdfActionsProps> = ({ 
  documentId,
  documentText,
  documentName,
  documentUrl,
  onSummarize
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleChatClick = () => {
    if (!documentText || documentText.trim() === '') {
      toast.error("No text available for this document");
      return;
    }
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center"
          onClick={onSummarize}
        >
          <FileText className="h-4 w-4 mr-2" />
          <span>Generate Summary</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center"
          onClick={handleChatClick}
        >
          <MessageSquareText className="h-4 w-4 mr-2" />
          <span>Chat with Text</span>
        </Button>
      </div>

      <DocumentQuestionDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        documentText={documentText}
        documentName={documentName}
        documentUrl={documentUrl}
      />
    </>
  );
};

export default DocumentPdfActions;
