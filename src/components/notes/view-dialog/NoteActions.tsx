
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { Note } from '../types';
import NoteSummaryButton from '@/components/NoteSummaryButton';

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
    <div className={isMobile ? "grid grid-cols-2 gap-2 mb-4" : "flex items-center gap-2 mb-4"}>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onEdit(note)}
        className={`h-8 text-xs ${isMobile ? 'flex justify-center items-center' : ''}`}
      >
        <Pencil className="h-3.5 w-3.5 mr-1.5" />
        Edit
      </Button>
      
      <Button 
        variant={isConfirmingDelete ? "destructive" : "outline"} 
        size="sm" 
        onClick={handleDeleteClick}
        className={`h-8 text-xs ${isMobile ? 'flex justify-center items-center' : ''}`}
      >
        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
        {isConfirmingDelete ? "Confirm" : "Delete"}
      </Button>
      
      {!isMobile && (
        <div className="ml-auto">
          <NoteSummaryButton 
            noteId={note.id}
            noteContent={note.content}
            noteName={note.title}
            projectId={note.project_id}
          />
        </div>
      )}
    </div>
  );
};

export default NoteActions;
