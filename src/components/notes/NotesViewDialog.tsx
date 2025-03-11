
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Clock, Edit, Trash2, FileText, Image, ExternalLink } from 'lucide-react';
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
      <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto overflow-x-hidden bg-gradient-to-b from-white to-slate-50">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle className="pr-8 text-xl font-semibold text-slate-800 break-words">{note.title}</DialogTitle>
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
          <DialogDescription className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <div className="flex items-center">
              <User className="h-3 w-3 mr-1 flex-shrink-0" />
              <div className="flex items-center">
                {note.creator_avatar ? (
                  <Avatar className="h-5 w-5 mr-1 flex-shrink-0">
                    <AvatarImage src={note.creator_avatar} alt={note.creator_name} />
                    <AvatarFallback>
                      {note.creator_name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : null}
                <span className="truncate max-w-[150px]">{note.creator_name}</span>
              </div>
            </div>
            <span>•</span>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
              <span>{formatDate(note.updated_at)}</span>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2 mb-4">
            {note.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs bg-accent/20 hover:bg-accent/30 transition-colors">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
        
        {note.source_document && (
          <div className="mb-4 flex items-center gap-2 p-2 bg-muted/40 rounded-md text-sm border border-muted-foreground/20">
            {note.source_document.type === 'pdf' ? (
              <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
            ) : (
              <Image className="h-4 w-4 text-green-500 flex-shrink-0" />
            )}
            <span className="text-muted-foreground flex-shrink-0">Source:</span>
            <span className="font-medium flex-grow truncate">{note.source_document.name}</span>
            <a 
              href={note.source_document.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-primary hover:underline flex-shrink-0"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">View Original</span>
            </a>
          </div>
        )}
        
        {note.source_document?.type === 'image' && (
          <div className="mt-2 mb-4">
            <img 
              src={note.source_document.url} 
              alt={note.source_document.name}
              className="rounded-md border border-border max-h-[300px] object-contain mx-auto"
            />
          </div>
        )}
        
        <div className="mt-4 bg-white p-4 rounded-md border border-slate-100 shadow-sm">
          <NoteContentDisplay content={note.content} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotesViewDialog;
