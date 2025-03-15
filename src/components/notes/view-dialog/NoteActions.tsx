
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { Note } from '../types';

interface NoteActionsProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  isMobile: boolean;
}

const NoteActions: React.FC<NoteActionsProps> = ({ 
  note, 
  onEdit, 
  onDelete,
  isMobile
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  
  const handleDeleteClick = () => {
    if (isConfirmingDelete) {
      onDelete(note.id);
      setIsConfirmingDelete(false);
    } else {
      setIsConfirmingDelete(true);
    }
  };
  
  return (
    <div className={`flex items-center gap-2 mb-4 ${isMobile ? 'flex-wrap' : ''}`}>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onEdit(note)}
        className="h-8"
      >
        <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
      </Button>
      
      <Button 
        variant={isConfirmingDelete ? "destructive" : "outline"} 
        size="sm" 
        onClick={handleDeleteClick}
        className="h-8"
      >
        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
        {isConfirmingDelete ? "Confirm" : "Delete"}
      </Button>
    </div>
  );
};

export default NoteActions;
