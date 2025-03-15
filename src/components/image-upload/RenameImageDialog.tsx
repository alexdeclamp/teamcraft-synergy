
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, FileText } from 'lucide-react';

interface RenameImageDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRename: (newName: string) => Promise<boolean>;
  imageName: string;
  isRenaming: boolean;
}

const RenameImageDialog: React.FC<RenameImageDialogProps> = ({
  isOpen,
  onOpenChange,
  onRename,
  imageName,
  isRenaming
}) => {
  const [newName, setNewName] = useState('');
  
  // Extract the file name without extension
  const getFileNameWithoutExtension = (fileName: string) => {
    if (!fileName) return '';
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
  };
  
  // Reset the form when the dialog opens
  useEffect(() => {
    if (isOpen) {
      setNewName(getFileNameWithoutExtension(imageName));
    }
  }, [isOpen, imageName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    const success = await onRename(newName);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Rename Image
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="image-name">Current name: <span className="font-normal text-muted-foreground">{imageName}</span></Label>
            <Input
              id="image-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new name"
              className="w-full"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              The file extension will be preserved automatically.
            </p>
          </div>
          
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isRenaming}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!newName.trim() || isRenaming || newName === getFileNameWithoutExtension(imageName)}
            >
              {isRenaming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Renaming...
                </>
              ) : (
                'Rename'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RenameImageDialog;
