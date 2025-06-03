
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Database, Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { useNoteEmbeddings } from '@/hooks/notes/useNoteEmbeddings';
import { Note } from './types';

interface EmbeddingManagerProps {
  notes: Note[];
  projectId: string;
}

const EmbeddingManager: React.FC<EmbeddingManagerProps> = ({ notes, projectId }) => {
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { batchGenerateEmbeddings } = useNoteEmbeddings();

  const notesWithoutEmbeddings = notes.filter(note => 
    !note.embedding || 
    (typeof note.embedding === 'string' && !note.embedding.trim()) ||
    (Array.isArray(note.embedding) && note.embedding.length === 0)
  );
  const hasUnprocessedNotes = notesWithoutEmbeddings.length > 0;

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-500" />
          <CardTitle>Vector Database</CardTitle>
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
                  Generate Embeddings
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
  );
};

export default EmbeddingManager;
