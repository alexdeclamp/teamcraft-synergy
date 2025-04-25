
import { useState, useEffect } from 'react';
import { resetBodyStyles } from '@/utils/dialogUtils';

export function useDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Clean up dialog effects when component unmounts or dialog state changes
  useEffect(() => {
    // Clean up when dialog closes
    if (!isDialogOpen) {
      resetBodyStyles();
    }

    // Reset dialog state and clean up when component unmounts
    return () => {
      setIsDialogOpen(false);
      resetBodyStyles();
    };
  }, [isDialogOpen]);

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetBodyStyles();
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
