
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Note } from './types';
import { formatDistanceToNow } from 'date-fns';
import { useNoteDateFormat } from '@/hooks/notes/useNoteDateFormat';
import { CalendarClock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dispatch, SetStateAction } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  
  const formattedDate = note.updated_at 
    ? formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })
    : '';

  return (
    <Card 
      className="hover:shadow-sm transition-all cursor-pointer border-muted"
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <h3 className="font-medium text-base break-words line-clamp-2 mb-2">
          {note.title || "Untitled Note"}
        </h3>
        
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <CalendarClock className="h-3 w-3 mr-1 flex-shrink-0" />
            <span>{formattedDate}</span>
          </div>
          
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {note.tags.slice(0, 2).map(tag => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="text-xs px-1.5 py-0 h-5"
                >
                  {tag}
                </Badge>
              ))}
              {note.tags.length > 2 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                  +{note.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotesCard;
