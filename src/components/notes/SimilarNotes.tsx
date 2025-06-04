
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, ExternalLink, Loader2, AlertCircle, X } from 'lucide-react';
import { useVectorSearch } from '@/hooks/notes/useVectorSearch';
import { Note } from './types';

interface SimilarNotesProps {
  currentNote: Note | null;
  onNoteSelect: (note: Note) => void;
  isViewDialogOpen?: boolean;
}

const SimilarNotes: React.FC<SimilarNotesProps> = ({ currentNote, onNoteSelect, isViewDialogOpen = false }) => {
  const [similarNotes, setSimilarNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { findSimilarNotes } = useVectorSearch();

  useEffect(() => {
    const loadSimilarNotes = async () => {
      // Only load similar notes when we have a current note and isViewDialogOpen is true
      if (!currentNote?.id || !isViewDialogOpen) {
        setSimilarNotes([]);
        setHasSearched(false);
        return;
      }
      
      setLoading(true);
      setHasSearched(true);
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
  }, [currentNote?.id, currentNote?.project_id, isViewDialogOpen]);

  const getScoreColor = (similarity: number) => {
    if (similarity >= 0.8) return 'bg-green-100 text-green-800';
    if (similarity >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getScoreLabel = (similarity: number) => {
    if (similarity >= 0.8) return 'High';
    if (similarity >= 0.7) return 'Good';
    return 'Weak';
  };

  const handleClose = () => {
    setSimilarNotes([]);
    setHasSearched(false);
  };

  // Don't show anything if we don't have a current note or not in view mode
  if (!currentNote || !isViewDialogOpen) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <CardTitle className="text-sm">Similar Notes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Click "Similar Notes" on any note to see related content</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <CardTitle className="text-sm">Similar Notes</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Finding similar notes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasSearched && similarNotes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <CardTitle className="text-sm">Similar Notes</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <div>
              <p className="text-sm font-medium">No similar notes found</p>
              <p className="text-xs">This note appears to be unique in your project.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <CardTitle className="text-sm">Similar Notes</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-3 w-3" />
          </Button>
        </div>
        <CardDescription className="text-xs">
          Found {similarNotes.length} notes with related content to "{currentNote.title}"
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
              <div className="flex flex-col items-end gap-1 ml-2">
                <Badge variant="outline" className="text-xs">
                  {Math.round(note.similarity * 100)}%
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getScoreColor(note.similarity)}`}
                >
                  {getScoreLabel(note.similarity)}
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
