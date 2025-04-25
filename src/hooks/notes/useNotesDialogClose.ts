
import { resetBodyStyles, forceFullDialogCleanup, initializeDialogState } from '@/utils/dialogUtils';

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
  // Initialize dialog before opening to prevent flash-close
  const prepareDialogOpen = async (dialogType: 'create' | 'edit' | 'view') => {
    await initializeDialogState();
    console.log(`${dialogType} dialog state initialized`);
  };

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
    
    // Use a significantly longer delay to ensure the dialog close animation completes
    // before any cleanup occurs - this prevents the flash-close issue
    setTimeout(() => {
      console.log(`${dialogType} dialog cleanup executing after delay`);
      resetBodyStyles();
      forceFullDialogCleanup();
      
      // Only reset form for create/edit dialogs
      if (dialogType !== 'view') {
        resetForm();
      }
    }, 500); // Increased timeout for more reliable closing
  };

  return {
    handleCloseDialog,
    prepareDialogOpen
  };
}
