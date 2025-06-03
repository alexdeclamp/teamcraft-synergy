
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, ExternalLink, Loader2 } from 'lucide-react';
import { useVectorSearch } from '@/hooks/notes/useVectorSearch';
import { Note } from './types';

interface SimilarNotesProps {
  currentNote: Note;
  onNoteSelect: (note: Note) => void;
}

const SimilarNotes: React.FC<SimilarNotesProps> = ({ currentNote, onNoteSelect }) => {
  const [similarNotes, setSimilarNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { findSimilarNotes } = useVectorSearch();

  useEffect(() => {
    const loadSimilarNotes = async () => {
      if (!currentNote?.id) return;
      
      setLoading(true);
      try {
        const results = await findSimilarNotes(currentNote.id, currentNote.project_id, 5);
        // Filter out the current note from results
        const filtered = results.filter(note => note.id !== currentNote.id);
        setSimilarNotes(filtered);
      } catch (error) {
        console.error('Error loading similar notes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSimilarNotes();
  }, [currentNote?.id, findSimilarNotes]);

  if (!currentNote || loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <CardTitle className="text-sm">Similar Notes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Finding similar notes...</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No note selected</p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (similarNotes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <CardTitle className="text-sm">Similar Notes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No similar notes found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <CardTitle className="text-sm">Similar Notes</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Notes with related content based on semantic similarity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {similarNotes.map((note) => (
          <div 
            key={note.id}
            className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => onNoteSelect(note as Note)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium line-clamp-1">{note.title}</h4>
                {note.content && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {note.content}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-2">
                <Badge variant="outline" className="text-xs">
                  {Math.round(note.similarity * 100)}%
                </Badge>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SimilarNotes;
