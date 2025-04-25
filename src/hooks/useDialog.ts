
import { useState, useEffect } from 'react';
import { resetBodyStyles, forceFullDialogCleanup } from '@/utils/dialogUtils';

export function useDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Clean up dialog effects when component unmounts or dialog state changes
  useEffect(() => {
    // Clean up when dialog closes
    if (!isDialogOpen) {
      setTimeout(() => {
        resetBodyStyles();
        forceFullDialogCleanup();
      }, 50);
    }

    // Reset dialog state and clean up when component unmounts
    return () => {
      setIsDialogOpen(false);
      resetBodyStyles();
      forceFullDialogCleanup();
    };
  }, [isDialogOpen]);

  const closeDialog = () => {
    setIsDialogOpen(false);
    setTimeout(forceFullDialogCleanup, 50);
  };

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  return {
    isDialogOpen,
    setIsDialogOpen,
    closeDialog,
    openDialog
  };
}
