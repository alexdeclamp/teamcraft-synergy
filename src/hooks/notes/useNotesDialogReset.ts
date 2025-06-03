
import { forceFullDialogCleanup } from '@/utils/dialogUtils';

interface UseNotesDialogResetProps {
  setIsCreateOpen: (open: boolean) => void;
  setIsEditOpen: (open: boolean) => void;
  setIsViewOpen: (open: boolean) => void;
  clearCurrentNote: () => void;
}

export function useNotesDialogReset({
  setIsCreateOpen,
  setIsEditOpen,
  setIsViewOpen,
  clearCurrentNote
}: UseNotesDialogResetProps) {
  const resetDialogs = () => {
    // First reset the state
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setIsViewOpen(false);
    
    // Clear current note with delay to prevent UI flickers
    clearCurrentNote();
    
    // Force a complete cleanup
    forceFullDialogCleanup();
    
    console.log('All dialogs reset and cleaned up');
  };

  return { resetDialogs };
}
