
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseSummaryDialogProps {
  isOpen: boolean;
  hasSavedVersion: boolean;
  summary: string;
  projectId?: string;
  imageName?: string;
  sourceUrl?: string;
  sourceType?: 'pdf' | 'image';
  onNoteSaved?: () => void;
}

export const useSummaryDialog = ({
  isOpen,
  hasSavedVersion,
  summary,
  projectId,
  imageName,
  sourceUrl,
  sourceType,
  onNoteSaved
}: UseSummaryDialogProps) => {
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

  useEffect(() => {
    console.log('SummaryDialog props:', { 
      hasSavedVersion, 
      localHasSavedVersion, 
      projectId, 
      imageName, 
      sourceUrl, 
      sourceType 
    });
  }, [hasSavedVersion, localHasSavedVersion, projectId, imageName, sourceUrl, sourceType]);

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
    // Use a placeholder if title is not available
    const filename = `summary-${Date.now()}.txt`;
    a.download = filename;
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

  const hasSummary = summary.trim() !== '';
  
  return {
    feedbackGiven,
    isCreatingNote,
    localHasSavedVersion,
    hasSummary,
    handleCopy,
    handleDownload,
    handleFeedback,
    handleCreateNote
  };
};
