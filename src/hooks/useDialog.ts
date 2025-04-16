
import { useState, useEffect } from 'react';

export function useDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Clean up dialog effects when component unmounts, dialog closes, or route changes
  useEffect(() => {
    const cleanupStyles = () => {
      document.body.style.overflow = '';
      document.body.classList.remove('dialog-open', 'sheet-open');
    };

    // Clean up when dialog closes
    if (!isDialogOpen) {
      cleanupStyles();
    }

    // Reset dialog state and clean up when component unmounts or route changes
    return () => {
      setIsDialogOpen(false);
      cleanupStyles();
    };
  }, [isDialogOpen]);

  const closeDialog = () => {
    setIsDialogOpen(false);
    document.body.style.overflow = '';
    document.body.classList.remove('dialog-open', 'sheet-open');
  };

  return {
    isDialogOpen,
    setIsDialogOpen,
    closeDialog,
    openDialog: () => setIsDialogOpen(true)
  };
}
