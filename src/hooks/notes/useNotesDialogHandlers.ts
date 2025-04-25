
import { useCallback } from 'react';

interface UseNotesDialogHandlersProps {
  prepareDialogOpen: (dialogType: 'view' | 'create' | 'edit') => Promise<boolean>;
  handleCloseDialog: (dialogType: 'view' | 'create' | 'edit') => void;
  setIsCreateOpen: (open: boolean) => void;
  setIsEditOpen: (open: boolean) => void;
  setIsViewOpen: (open: boolean) => void;
}

export const useNotesDialogHandlers = ({
  prepareDialogOpen,
  handleCloseDialog,
  setIsCreateOpen,
  setIsEditOpen,
  setIsViewOpen
}: UseNotesDialogHandlersProps) => {
  const handleOpenChange = useCallback(async (open: boolean, dialogType: 'view' | 'create' | 'edit') => {
    console.log(`Dialog ${dialogType} open change requested: ${open}`);
    
    if (open) {
      try {
        console.log(`Initializing ${dialogType} dialog before opening`);
        const readyToOpen = await prepareDialogOpen(dialogType);
        
        if (!readyToOpen) {
          console.log(`Failed to initialize ${dialogType} dialog`);
          return;
        }
        
        setTimeout(() => {
          console.log(`Setting ${dialogType} dialog open state to true`);
          switch (dialogType) {
            case 'view':
              setIsViewOpen(true);
              break;
            case 'create':
              setIsCreateOpen(true);
              break;
            case 'edit':
              setIsEditOpen(true);
              break;
          }
        }, 50);
      } catch (error) {
        console.error(`Error opening ${dialogType} dialog:`, error);
      }
    } else {
      handleCloseDialog(dialogType);
    }
  }, [prepareDialogOpen, handleCloseDialog, setIsCreateOpen, setIsEditOpen, setIsViewOpen]);

  return { handleOpenChange };
};
