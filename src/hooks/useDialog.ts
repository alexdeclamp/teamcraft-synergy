
import { useState, useEffect, useCallback } from 'react';
import { resetBodyStyles } from '@/utils/dialogUtils';

export function useDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Clean up dialog effects when component unmounts or dialog state changes
  useEffect(() => {
    // Clean up when dialog closes
    if (!isDialogOpen) {
      try {
        resetBodyStyles();
      } catch (error) {
        console.error('Error cleaning up dialog:', error);
      }
    }

    // Reset dialog state and clean up when component unmounts
    return () => {
      try {
        setIsDialogOpen(false);
        resetBodyStyles();
      } catch (error) {
        console.error('Error during dialog unmount cleanup:', error);
      }
    };
  }, [isDialogOpen]);

  const closeDialog = useCallback(() => {
    try {
      setIsDialogOpen(false);
      resetBodyStyles();
    } catch (error) {
      console.error('Error closing dialog:', error);
    }
  }, []);

  const openDialog = useCallback(() => {
    try {
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Error opening dialog:', error);
    }
  }, []);

  return {
    isDialogOpen,
    setIsDialogOpen,
    closeDialog,
    openDialog
  };
}
