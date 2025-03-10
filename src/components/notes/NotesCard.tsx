
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FileText, User, Clock, Edit, Trash2 } from 'lucide-react';
import NoteSummaryButton from '../NoteSummaryButton';
import { Note } from './types';
import { formatNoteContent } from './NotesFormatter';

interface NotesCardProps {
  note: Note;
  userId: string | undefined;
  activeTag: string | null;
  setActiveTag: (tag: string | null) => void;
  onView: (note: Note) => void;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  formatDate: (dateString: string) => string;
}

const NotesCard: React.FC<NotesCardProps> = ({
  note,
  userId,
  activeTag,
  setActiveTag,
  onView,
  onEdit,
  onDelete,
  formatDate
}) => {
  return (
    <Card 
      key={note.id} 
      className="hover:bg-accent/5 transition-colors cursor-pointer" 
      onClick={() => onView(note)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium text-lg">{note.title}</h3>
            </div>
            
            <div className="text-muted-foreground text-sm mb-2 line-clamp-2">
              {note.content ? (
                <div>
                  {formatNoteContent(note.content)}
                </div>
              ) : "No content"}
            </div>
            
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {note.tags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="text-xs bg-accent/20" 
                    onClick={e => {
                      e.stopPropagation();
                      setActiveTag(tag === activeTag ? null : tag);
                    }}
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <div className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                <div className="flex items-center">
                  {note.creator_avatar ? (
                    <Avatar className="h-4 w-4 mr-1">
                      <AvatarImage src={note.creator_avatar} alt={note.creator_name} />
                      <AvatarFallback>
                        {note.creator_name?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : null}
                  <span>{note.creator_name}</span>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{formatDate(note.updated_at)}</span>
              </div>
            </div>
          </div>
          
          {note.user_id === userId && (
            <div className="flex space-x-1 ml-2" onClick={e => e.stopPropagation()}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <NoteSummaryButton 
                      noteId={note.id} 
                      noteTitle={note.title} 
                      noteContent={note.content} 
                    />
                  </TooltipTrigger>
                  <TooltipContent>Generate Summary</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={e => {
                        e.stopPropagation();
                        onEdit(note);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive" 
                      onClick={e => {
                        e.stopPropagation();
                        onDelete(note.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotesCard;
