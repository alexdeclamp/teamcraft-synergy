
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Clock, Edit, Trash2 } from 'lucide-react';
import { Note } from './types';
import NoteContentDisplay from './NotesFormatter';

interface NotesViewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note | null;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  formatDate: (dateString: string) => string;
  userId: string | undefined;
}

const NotesViewDialog: React.FC<NotesViewDialogProps> = ({
  isOpen,
  onOpenChange,
  note,
  onEdit,
  onDelete,
  formatDate,
  userId
}) => {
  if (!note) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle className="pr-8">{note.title}</DialogTitle>
            <div className="flex space-x-1">
              {note.user_id === userId && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => {
                      onOpenChange(false);
                      setTimeout(() => onEdit(note), 100);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive" 
                    onClick={() => {
                      onOpenChange(false);
                      setTimeout(() => onDelete(note.id), 100);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <div className="flex items-center">
              <User className="h-3 w-3 mr-1" />
              <div className="flex items-center">
                {note.creator_avatar ? (
                  <Avatar className="h-5 w-5 mr-1">
                    <AvatarImage src={note.creator_avatar} alt={note.creator_name} />
                    <AvatarFallback>
                      {note.creator_name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : null}
                <span>{note.creator_name}</span>
              </div>
            </div>
            <span>•</span>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatDate(note.updated_at)}</span>
            </div>
          </div>
        </DialogHeader>
        
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {note.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs bg-accent/20">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="mt-4">
          <NoteContentDisplay content={note.content} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotesViewDialog;
