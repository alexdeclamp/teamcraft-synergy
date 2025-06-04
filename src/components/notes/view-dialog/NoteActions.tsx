
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Copy, Sparkles } from 'lucide-react';
import { Note } from '../types';

interface NoteActionsProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (note: Note) => void;
  onViewSimilar?: (note: Note) => void;
  isMobile: boolean;
}

const NoteActions: React.FC<NoteActionsProps> = ({ 
  note, 
  onEdit, 
  onDelete,
  onDuplicate,
  onViewSimilar,
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

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(note);
    } else {
      // Create a duplicate without ID
      const duplicatedNote = {
        ...note,
        id: '', // This will be generated when saved
        title: `${note.title} (Copy)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      onEdit(duplicatedNote);
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
        variant="outline" 
        size="sm" 
        onClick={handleDuplicate}
        className="h-8"
      >
        <Copy className="h-3.5 w-3.5 mr-1.5" /> Duplicate
      </Button>

      {onViewSimilar && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onViewSimilar(note)}
          className="h-8"
        >
          <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Similar Notes
        </Button>
      )}
      
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
