
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Note } from './types';
import { formatDistanceToNow } from 'date-fns';
import { useNoteDateFormat } from '@/hooks/notes/useNoteDateFormat';
import { CalendarClock, MoreVertical, Pencil, Trash2, Copy, User, Database, Sparkles, Eye } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';

interface NotesCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onView: (note: Note) => void;
  onDelete: (id: string) => void;
  onViewSimilar?: (note: Note) => void;
  userId?: string;
  activeTag?: string;
  setActiveTag?: Dispatch<SetStateAction<string>>;
  formatDate?: (dateString: string) => string;
  isLast?: boolean;
}

const NotesCard: React.FC<NotesCardProps> = ({ 
  note, 
  onEdit, 
  onView, 
  onDelete,
  onViewSimilar,
  userId,
  activeTag,
  setActiveTag,
  formatDate: propFormatDate,
  isLast = false
}) => {
  const { formatDate: hookFormatDate } = useNoteDateFormat();
  const formatDateFn = propFormatDate || hookFormatDate;
  const isMobile = useIsMobile();
  
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    // Don't auto-open view, let user choose action
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

  // Simplified check for PostgreSQL vector embeddings
  const hasEmbedding = note.embedding != null && note.embedding !== '';

  return (
    <div className="group">
      <div 
        className="px-4 py-6 hover:bg-slate-50/80 transition-colors rounded-md"
        onClick={handleCardClick}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-medium text-base break-words line-clamp-2">
                {note.title || "Untitled Note"}
              </h3>
              
              {note.creator_name && (
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <User className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span>{note.creator_name}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <div className="flex items-center text-xs text-muted-foreground">
                <CalendarClock className="h-3 w-3 mr-1 flex-shrink-0" />
                <span>{formattedDate}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {hasEmbedding && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5 bg-green-100 text-green-700">
                    <Database className="h-3 w-3 mr-1" />
                    Embedded
                  </Badge>
                )}
                
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
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
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 ml-1"
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

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onView(note);
              }}
              className="h-8"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" /> View
            </Button>
            
            {onViewSimilar && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onViewSimilar(note);
                }}
                className="h-8"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Similar Notes
              </Button>
            )}
          </div>
        </div>
      </div>
      {!isLast && <Separator className="my-1 opacity-40" />}
    </div>
  );
};

export default NotesCard;
