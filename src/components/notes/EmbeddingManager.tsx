
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Database, Sparkles, Loader2, CheckCircle, RefreshCw, FileText } from 'lucide-react';
import { useNoteEmbeddings } from '@/hooks/notes/useNoteEmbeddings';
import { Note } from './types';
import { toast } from 'sonner';

interface EmbeddingManagerProps {
  notes: Note[];
  projectId: string;
}

const EmbeddingManager: React.FC<EmbeddingManagerProps> = ({ notes, projectId }) => {
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [processingNoteId, setProcessingNoteId] = useState<string | null>(null);
  const { generateEmbedding, batchGenerateEmbeddings } = useNoteEmbeddings();

  const notesWithoutEmbeddings = notes.filter(note => 
    !note.embedding || 
    (typeof note.embedding === 'string' && !note.embedding.trim()) ||
    (Array.isArray(note.embedding) && note.embedding.length === 0)
  );
  const hasUnprocessedNotes = notesWithoutEmbeddings.length > 0;

  const hasEmbedding = (note: Note) => {
    return note.embedding && 
           ((typeof note.embedding === 'string' && note.embedding.trim()) ||
            (Array.isArray(note.embedding) && note.embedding.length > 0));
  };

  const handleGenerateEmbeddings = async () => {
    if (!hasUnprocessedNotes) return;

    setIsProcessing(true);
    setProgress(0);
    setCompleted(false);

    try {
      const notesToProcess = notesWithoutEmbeddings.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content
      }));

      // Process notes in batches and update progress
      const batchSize = 5;
      let processed = 0;

      for (let i = 0; i < notesToProcess.length; i += batchSize) {
        const batch = notesToProcess.slice(i, i + batchSize);
        await batchGenerateEmbeddings(batch);
        
        processed += batch.length;
        setProgress((processed / notesToProcess.length) * 100);
      }

      setCompleted(true);
    } catch (error) {
      console.error('Error generating embeddings:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegenerateEmbedding = async (note: Note) => {
    setProcessingNoteId(note.id);
    try {
      const text = `${note.title} ${note.content || ''}`.trim();
      const success = await generateEmbedding(note.id, text);
      if (success) {
        toast.success('Embedding regenerated successfully');
      }
    } catch (error) {
      console.error('Error regenerating embedding:', error);
      toast.error('Failed to regenerate embedding');
    } finally {
      setProcessingNoteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-500" />
            <CardTitle>Vector Database Overview</CardTitle>
          </div>
          <CardDescription>
            Generate embeddings for semantic search capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Notes with embeddings:</span>
              <span className="font-medium">
                {notes.length - notesWithoutEmbeddings.length} / {notes.length}
              </span>
            </div>
            <Progress 
              value={notes.length > 0 ? ((notes.length - notesWithoutEmbeddings.length) / notes.length) * 100 : 0} 
              className="h-2"
            />
          </div>

          {hasUnprocessedNotes && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {notesWithoutEmbeddings.length} notes need embeddings for semantic search.
              </p>
              
              <Button 
                onClick={handleGenerateEmbeddings}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing... {Math.round(progress)}%
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate All Missing Embeddings
                  </>
                )}
              </Button>

              {isProcessing && (
                <Progress value={progress} className="h-2" />
              )}
            </div>
          )}

          {!hasUnprocessedNotes && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>All notes have embeddings for semantic search</span>
            </div>
          )}

          {completed && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Embedding generation completed successfully!</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notes Embedding Status
          </CardTitle>
          <CardDescription>
            Detailed view of each note's embedding status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No notes found in this project
            </p>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{note.title}</h4>
                      <Badge 
                        variant={hasEmbedding(note) ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {hasEmbedding(note) ? "Embedded" : "No Embedding"}
                      </Badge>
                    </div>
                    {note.content && (
                      <p className="text-sm text-muted-foreground truncate">
                        {note.content.substring(0, 100)}
                        {note.content.length > 100 ? "..." : ""}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRegenerateEmbedding(note)}
                    disabled={processingNoteId === note.id}
                    className="ml-2 flex-shrink-0"
                  >
                    {processingNoteId === note.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="ml-1 hidden sm:inline">
                      {hasEmbedding(note) ? "Regenerate" : "Generate"}
                    </span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmbeddingManager;
