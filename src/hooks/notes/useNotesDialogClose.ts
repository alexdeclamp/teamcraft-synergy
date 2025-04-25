
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
  // Enhanced dialog initialization with proper timing
  const prepareDialogOpen = async (dialogType: 'create' | 'edit' | 'view') => {
    console.log(`${dialogType} dialog initializing...`);
    
    // First clean up any lingering dialog state
    forceFullDialogCleanup();
    
    // Apply dialog-open class to prevent scrolling while dialog is open
    document.body.classList.add('dialog-open');
    
    // Initialize dialog state with a promise
    await initializeDialogState();
    
    // Add a small delay to ensure DOM is ready before opening dialog
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log(`${dialogType} dialog state fully initialized and ready to open`);
    return true;
  };

  // Enhanced dialog close handler with delayed cleanup
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
    }, 800); // Increased timeout for more reliable closing
  };

  return {
    handleCloseDialog,
    prepareDialogOpen
  };
}
