
import { useState, useEffect } from 'react';

export function useDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Reset dialog state when component unmounts or route changes
  useEffect(() => {
    return () => {
      setIsDialogOpen(false);
    };
  }, []);

  return {
    isDialogOpen,
    setIsDialogOpen,
    closeDialog: () => setIsDialogOpen(false),
    openDialog: () => setIsDialogOpen(true)
  };
}
