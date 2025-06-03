
import { useState, useEffect } from 'react';
import { forceFullDialogCleanup } from '@/utils/dialogUtils';

export function useNotesDialogState() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Watch dialog state changes and clean up when all dialogs are closed
  useEffect(() => {
    if (!isCreateOpen && !isEditOpen && !isViewOpen) {
      console.log('All note dialogs closed, executing cleanup');
      forceFullDialogCleanup();
    }
  }, [isCreateOpen, isEditOpen, isViewOpen]);

  return {
    isCreateOpen,
    setIsCreateOpen,
    isEditOpen,
    setIsEditOpen,
    isViewOpen,
    setIsViewOpen
  };
}
