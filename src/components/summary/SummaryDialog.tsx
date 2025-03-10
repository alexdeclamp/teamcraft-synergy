import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import SummaryDialogHeader from './SummaryDialogHeader';
import SummaryContent from './SummaryContent';
import SummaryFeedback from './SummaryFeedback';
import SummaryActions from './SummaryActions';
import { AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface SummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  summary: string;
  isLoading: boolean;
  hasSavedVersion?: boolean;
  projectId?: string;
  imageName?: string;
  sourceUrl?: string;
  sourceType?: 'pdf' | 'image';
}

const SummaryDialog: React.FC<SummaryDialogProps> = ({
  isOpen,
  onClose,
  title,
  summary,
  isLoading,
  hasSavedVersion = false,
  projectId,
  imageName,
  sourceUrl,
  sourceType = 'pdf'
}) => {
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [localHasSavedVersion, setLocalHasSavedVersion] = useState(hasSavedVersion);
  const { user } = useAuth();
  
  useEffect(() => {
    if (isOpen) {
      setFeedbackGiven(false);
      setLocalHasSavedVersion(hasSavedVersion);
    }
  }, [isOpen, hasSavedVersion]);

  const handleCopy = () => {
    if (!summary || summary.trim() === '') {
      toast.error("No summary available to copy");
      return;
    }
    navigator.clipboard.writeText(summary);
    toast.success('Summary copied to clipboard');
  };

  const handleDownload = () => {
    if (!summary || summary.trim() === '') {
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
    toast.success(`Thank you for your feedback!`);
    setFeedbackGiven(true);
  };

  const handleCreateNote = async () => {
    if (!summary || summary.trim() === '' || !projectId || !user) {
      toast.error("Cannot create note from this summary");
      return;
    }

    if (localHasSavedVersion) {
      toast.info("This summary is already saved as a note");
      return;
    }

    try {
      setIsCreatingNote(true);
      
      const noteTitle = imageName 
        ? `Summary: ${imageName}` 
        : "Document Summary";
      
      const sourceDocument = (sourceUrl && imageName) ? {
        type: sourceType,
        url: sourceUrl,
        name: imageName
      } : null;
      
      const { data, error } = await supabase
        .from('project_notes')
        .insert({
          title: noteTitle,
          content: summary,
          project_id: projectId,
          user_id: user.id,
          tags: ['document', 'summary', 'ai-generated'],
          source_document: sourceDocument
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Summary saved as a note successfully');
      setLocalHasSavedVersion(true);
    } catch (error: any) {
      console.error('Error creating note:', error);
      toast.error(`Failed to create note: ${error.message}`);
    } finally {
      setIsCreatingNote(false);
    }
  };

  const hasSummary = summary.trim() !== '' && !isLoading;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[750px] max-h-[85vh] flex flex-col">
        <div className="absolute right-4 top-4">
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </div>
        
        <SummaryDialogHeader 
          title={title} 
          hasSavedVersion={localHasSavedVersion} 
          isLoading={isLoading} 
        />
        
        <div className="mt-4 overflow-y-auto flex-grow">
          <SummaryContent 
            isLoading={isLoading} 
            summary={summary} 
            hasSummary={hasSummary} 
          />
        </div>
        
        {!localHasSavedVersion && hasSummary && projectId && (
          <Alert variant="default" className="mt-4 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription>
              <strong>Important:</strong> Click "Save as Note" to add this summary to your project's Brain. This allows your AI to learn from this document.
            </AlertDescription>
          </Alert>
        )}
        
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2 mt-4">
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            {!isLoading && localHasSavedVersion && !feedbackGiven && (
              <SummaryFeedback 
                feedbackGiven={feedbackGiven} 
                onFeedback={handleFeedback} 
              />
            )}
            {feedbackGiven && (
              <p className="text-sm text-muted-foreground">Thanks for your feedback!</p>
            )}
          </div>
          
          <SummaryActions 
            summary={summary}
            onCopy={handleCopy}
            onDownload={handleDownload}
            onCreateNote={handleCreateNote}
            isCreatingNote={isCreatingNote}
            projectId={projectId}
            hasSummary={hasSummary}
            buttonText={localHasSavedVersion ? "Already Saved" : "Save as Note"}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SummaryDialog;
