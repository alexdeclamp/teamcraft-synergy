
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import SummaryDialogHeader from './SummaryDialogHeader';
import SummaryContent from './SummaryContent';
import SummaryFooter from './SummaryFooter';
import SummaryAlert from './SummaryAlert';
import SummaryCloseButton from './SummaryCloseButton';

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
  onNoteSaved?: () => void;
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
  sourceType = 'pdf',
  onNoteSaved
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

  // Debug logging to identify issues
  useEffect(() => {
    console.log('SummaryDialog props:', { 
      title, 
      hasSavedVersion, 
      localHasSavedVersion, 
      projectId, 
      imageName, 
      sourceUrl, 
      sourceType 
    });
  }, [title, hasSavedVersion, localHasSavedVersion, projectId, imageName, sourceUrl, sourceType]);

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
      
      // Create a proper source_document object
      const sourceDocument = sourceUrl && imageName ? {
        type: sourceType,
        url: sourceUrl,
        name: imageName
      } : null;
      
      console.log('Creating note with source document:', sourceDocument);
      
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
      
      // Notify parent that a note was saved if callback exists
      if (onNoteSaved) {
        onNoteSaved();
      }
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
          <SummaryCloseButton />
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
        
        <SummaryAlert 
          hasSummary={hasSummary}
          localHasSavedVersion={localHasSavedVersion}
          projectId={projectId}
        />
        
        <SummaryFooter 
          isLoading={isLoading}
          localHasSavedVersion={localHasSavedVersion}
          feedbackGiven={feedbackGiven}
          summary={summary}
          isCreatingNote={isCreatingNote}
          projectId={projectId}
          hasSummary={hasSummary}
          buttonText={localHasSavedVersion ? "Already Saved" : "Save as Note"}
          onFeedback={handleFeedback}
          onCopy={handleCopy}
          onDownload={handleDownload}
          onCreateNote={handleCreateNote}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SummaryDialog;
