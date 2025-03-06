
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Loader2, Download, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner';

interface SummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  summary: string;
  isLoading: boolean;
}

const SummaryDialog: React.FC<SummaryDialogProps> = ({
  isOpen,
  onClose,
  title,
  summary,
  isLoading
}) => {
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const handleCopy = () => {
    if (!summary) {
      toast.error("No summary available to copy");
      return;
    }
    navigator.clipboard.writeText(summary);
    toast.success('Summary copied to clipboard');
  };

  const handleDownload = () => {
    if (!summary) {
      toast.error("No summary available to download");
      return;
    }
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-summary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Summary downloaded successfully');
  };

  const handleFeedback = (isPositive: boolean) => {
    // In a real app, you might want to send this feedback to your backend
    toast.success(`Thank you for your feedback!`);
    setFeedbackGiven(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            AI-generated summary to help you remember key elements and learnings.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 overflow-y-auto flex-grow">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Generating summary...</p>
            </div>
          ) : summary ? (
            <div className="p-4 bg-accent/20 rounded-md whitespace-pre-wrap max-h-[50vh] overflow-y-auto">
              {summary}
            </div>
          ) : (
            <div className="p-4 bg-accent/10 rounded-md flex items-center justify-center h-32">
              <p className="text-muted-foreground">No summary available yet.</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2 mt-4">
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            {!isLoading && summary && !feedbackGiven && (
              <>
                <p className="text-sm text-muted-foreground mr-2">Was this summary helpful?</p>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleFeedback(true)}
                  className="h-8 w-8"
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleFeedback(false)}
                  className="h-8 w-8"
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </>
            )}
            {feedbackGiven && (
              <p className="text-sm text-muted-foreground">Thanks for your feedback!</p>
            )}
          </div>
          
          <div className="flex space-x-2">
            {!isLoading && summary && (
              <>
                <Button onClick={handleCopy} size="sm" variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button onClick={handleDownload} size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </>
            )}
            <DialogClose asChild>
              <Button variant="outline" size="sm">Close</Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SummaryDialog;
