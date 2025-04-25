
import { resetBodyStyles, forceFullDialogCleanup } from '@/utils/dialogUtils';

interface UseNotesDialogCloseProps {
  setIsCreateOpen: (open: boolean) => void;
  setIsEditOpen: (open: boolean) => void;
  setIsViewOpen: (open: boolean) => void;
  resetForm: () => void;
}

export function useNotesDialogClose({
  setIsCreateOpen,
  setIsEditOpen,
  setIsViewOpen,
  resetForm
}: UseNotesDialogCloseProps) {
  const handleCloseDialog = (dialogType: 'create' | 'edit' | 'view') => {
    console.log(`${dialogType} dialog closing through handler`);
    resetBodyStyles();
    
    // First update the dialog state
    switch (dialogType) {
      case 'create':
        setIsCreateOpen(false);
        break;
      case 'edit':
        setIsEditOpen(false);
        break;
      case 'view':
        setIsViewOpen(false);
        break;
    }
    
    // Then clean up with a small delay
    setTimeout(() => {
      forceFullDialogCleanup();
      // Only reset form for create/edit dialogs
      if (dialogType !== 'view') {
        resetForm();
      }
    }, 50);
  };

  return {
    handleCloseDialog
  };
}
