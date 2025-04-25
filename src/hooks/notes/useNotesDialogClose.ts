
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
    
    // Don't reset body styles immediately to prevent flashing
    // Add a delay to ensure the dialog close animation completes
    setTimeout(() => {
      resetBodyStyles();
      forceFullDialogCleanup();
      
      // Only reset form for create/edit dialogs
      if (dialogType !== 'view') {
        resetForm();
      }
    }, 200); // Increased timeout for more reliable closing
  };

  return {
    handleCloseDialog
  };
}
