
import { useDialog } from './useDialog';
import { useSummaryState } from './useSummaryState';
import { useGenerateSummary } from './useGenerateSummary';

interface UseNoteSummaryProps {
  noteId: string;
  noteContent: string | null;
  noteName?: string;
  projectId?: string;
}

export function useNoteSummary({ noteId, noteContent, noteName, projectId }: UseNoteSummaryProps) {
  const { isDialogOpen, setIsDialogOpen, openDialog } = useDialog();
  const { 
    summary, 
    setSummary, 
    savedSummary, 
    setSavedSummary, 
    isLoadingSaved, 
    hasSummary,
    setHasSummary 
  } = useSummaryState({ noteId, projectId });
  
  const { isGenerating, generateSummary } = useGenerateSummary({
    noteContent,
    projectId,
    noteId,
    noteName,
    setSummary,
    setSavedSummary,
    setHasSummary,
    openDialog
  });

  return {
    isGenerating,
    summary,
    savedSummary,
    hasSummary,
    isDialogOpen,
    setIsDialogOpen,
    generateSummary
  };
}
