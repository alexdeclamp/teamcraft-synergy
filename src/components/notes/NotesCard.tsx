
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Note } from './types';
import { formatDistanceToNow } from 'date-fns';
import { useNoteDateFormat } from '@/hooks/notes/useNoteDateFormat';
import { CalendarClock, FileText } from 'lucide-react';
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
      className="group hover:shadow transition-all cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      <CardContent className="p-5 pt-5">
        <div className="space-y-2">
          <div className="flex flex-col">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-medium text-lg sm:text-xl break-words line-clamp-2 overflow-hidden hyphens-auto">
                {note.title || "Untitled Note"}
              </h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground mb-2">
              <div className="flex items-center">
                <CalendarClock className="h-3 w-3 mr-1 flex-shrink-0" />
                <span>{formattedDate}</span>
              </div>
              
              {note.source_document && (
                <div className="flex items-center ml-2">
                  <FileText className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate max-w-[150px]">{note.source_document.name}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2 pt-2">
            <div className="flex flex-wrap gap-1 mt-2 sm:mt-0">
              {note.tags && note.tags.map(tag => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="text-xs px-2 py-0 hover:bg-secondary/60"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotesCard;
