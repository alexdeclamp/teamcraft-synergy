
import { useEffect } from 'react';
import { forceFullDialogCleanup } from '@/utils/dialogUtils';
import { Note } from '@/components/notes/types';

interface UseNotesDialogCleanupProps {
  isCreateOpen: boolean;
  isEditOpen: boolean;
  isViewOpen: boolean;
  resetForm: () => void;
}

export function useNotesDialogCleanup({
  isCreateOpen,
  isEditOpen,
  isViewOpen,
  resetForm
}: UseNotesDialogCleanupProps) {
  // Ensure cleanup when component unmounts
  useEffect(() => {
    return () => {
      try {
        console.log('ProjectNotes component unmounting, cleaning up...');
        resetForm();
        forceFullDialogCleanup();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    };
  }, []); // Empty dependency array means this only runs on unmount

  // Additional cleanup effect when dialogs change state
  useEffect(() => {
    if (!isCreateOpen && !isEditOpen && !isViewOpen) {
      console.log('All dialogs closed in ProjectNotes, running cleanup');
      setTimeout(() => {
        forceFullDialogCleanup();
        if (!isEditOpen && !isCreateOpen) {
          resetForm();
        }
      }, 150);
    }
  }, [isCreateOpen, isEditOpen, isViewOpen, resetForm]);

  const handleCloseViewDialog = () => {
    console.log('View dialog closing with custom handler');
    forceFullDialogCleanup();
  };
  
  const handleCloseCreateDialog = () => {
    console.log('Create dialog closing with custom handler');
    forceFullDialogCleanup();
    resetForm();
  };
  
  const handleCloseEditDialog = () => {
    console.log('Edit dialog closing with custom handler');
    forceFullDialogCleanup();
    resetForm();
  };

  return {
    handleCloseViewDialog,
    handleCloseCreateDialog,
    handleCloseEditDialog
  };
}
