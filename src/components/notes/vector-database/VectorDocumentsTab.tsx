
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  XCircle, 
  Loader2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useNoteEmbeddings } from '@/hooks/notes/useNoteEmbeddings';
import { NoteWithProject } from './types';
import { toast } from 'sonner';

interface VectorDocumentsTabProps {
  notes: NoteWithProject[];
  onRefresh: () => Promise<void>;
}

const VectorDocumentsTab: React.FC<VectorDocumentsTabProps> = ({ notes, onRefresh }) => {
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'embedded' | 'missing'>('all');
  const [progress, setProgress] = useState(0);
  
  const { batchGenerateEmbeddings } = useNoteEmbeddings();

  const handleSelectNote = (noteId: string, checked: boolean) => {
    const newSelected = new Set(selectedNotes);
    if (checked) {
      newSelected.add(noteId);
    } else {
      newSelected.delete(noteId);
    }
    setSelectedNotes(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotes(new Set(filteredNotes.map(note => note.id)));
    } else {
      setSelectedNotes(new Set());
    }
  };

  const handleBatchEmbedding = async () => {
    if (selectedNotes.size === 0) {
      toast.error('Please select notes to process');
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      const selectedNotesData = notes.filter(note => selectedNotes.has(note.id));
      const notesToProcess = selectedNotesData.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content || ''
      }));

      let processed = 0;
      const batchSize = 5;

      for (let i = 0; i < notesToProcess.length; i += batchSize) {
        const batch = notesToProcess.slice(i, i + batchSize);
        await batchGenerateEmbeddings(batch);
        
        processed += batch.length;
        setProgress((processed / notesToProcess.length) * 100);
      }

      await onRefresh();
      setSelectedNotes(new Set());
      toast.success(`Generated embeddings for ${processed} notes`);
    } catch (error) {
      console.error('Error processing embeddings:', error);
      toast.error('Failed to generate embeddings');
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const handleRegenerateEmbedding = async (noteId: string, title: string, content: string) => {
    try {
      await batchGenerateEmbeddings([{ id: noteId, title, content: content || '' }]);
      await onRefresh();
      toast.success('Embedding regenerated successfully');
    } catch (error) {
      console.error('Error regenerating embedding:', error);
      toast.error('Failed to regenerate embedding');
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchTerm === '' || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.content || '').toLowerCase().includes(searchTerm.toLowerCase());

    const hasEmbedding = note.embedding != null && note.embedding !== '';
    
    let matchesFilter = true;
    if (filterStatus === 'embedded') {
      matchesFilter = hasEmbedding;
    } else if (filterStatus === 'missing') {
      matchesFilter = !hasEmbedding;
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1">
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'embedded' | 'missing')}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Documents</option>
            <option value="embedded">Embedded Only</option>
            <option value="missing">Missing Embeddings</option>
          </select>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => handleSelectAll(selectedNotes.size !== filteredNotes.length)}
            variant="outline"
            size="sm"
          >
            {selectedNotes.size === filteredNotes.length ? 'Deselect All' : 'Select All'}
          </Button>
          <Button
            onClick={handleBatchEmbedding}
            disabled={selectedNotes.size === 0 || processing}
            size="sm"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing... {Math.round(progress)}%
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Embeddings ({selectedNotes.size})
              </>
            )}
          </Button>
        </div>
      </div>

      {processing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing embeddings...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle>Documents ({filteredNotes.length})</CardTitle>
          <CardDescription>
            {selectedNotes.size > 0 && `${selectedNotes.size} selected`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredNotes.map((note) => {
              const hasEmbedding = note.embedding != null && note.embedding !== '';
              return (
                <div key={note.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Checkbox
                    checked={selectedNotes.has(note.id)}
                    onCheckedChange={(checked) => handleSelectNote(note.id, checked as boolean)}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium line-clamp-1">{note.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {note.projects?.title || 'Unknown Project'}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {hasEmbedding ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Embedded
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-100 text-red-700">
                        <XCircle className="h-3 w-3 mr-1" />
                        Missing
                      </Badge>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRegenerateEmbedding(note.id, note.title, note.content || '')}
                      disabled={processing}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VectorDocumentsTab;
