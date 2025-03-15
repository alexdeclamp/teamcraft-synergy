
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Note } from './types';
import { formatDistanceToNow } from 'date-fns';
import { useNoteDateFormat } from '@/hooks/notes/useNoteDateFormat';
import { CalendarClock, MoreVertical, Pencil, Trash2, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dispatch, SetStateAction } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

interface NotesCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onView: (note: Note) => void;
  onDelete: (id: string) => void;
  userId?: string;
  activeTag?: string;
  setActiveTag?: Dispatch<SetStateAction<string>>;
  formatDate?: (dateString: string) => string;
}

const NotesCard: React.FC<NotesCardProps> = ({ 
  note, 
  onEdit, 
  onView, 
  onDelete,
  userId,
  activeTag,
  setActiveTag,
  formatDate: propFormatDate
}) => {
  const { formatDate: hookFormatDate } = useNoteDateFormat();
  const formatDateFn = propFormatDate || hookFormatDate;
  const isMobile = useIsMobile();
  
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onView(note);
  };

  const handleDuplicate = () => {
    // Clone the note without its id
    const duplicatedNote = {
      ...note,
      id: '', // This will be generated when saved
      title: `${note.title} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    onEdit(duplicatedNote);
  };
  
  const formattedDate = note.updated_at 
    ? formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })
    : '';

  return (
    <Card 
      className="hover:shadow-sm transition-all cursor-pointer border-muted"
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="font-medium text-base break-words line-clamp-2 pr-6">
            {note.title || "Untitled Note"}
          </h3>
          
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <div className="flex items-center text-xs text-muted-foreground">
              <CalendarClock className="h-3 w-3 mr-1 flex-shrink-0" />
              <span>{formattedDate}</span>
            </div>
            
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 ml-2">
                {note.tags.slice(0, 3).map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="text-xs px-1.5 py-0 h-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTag && setActiveTag(tag);
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
                {note.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                    +{note.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 absolute top-3 right-3"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onEdit(note);
                }}>
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicate();
                }}>
                  <Copy className="h-4 w-4 mr-2" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(note.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotesCard;
