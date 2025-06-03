
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  RefreshCw, 
  Zap,
  CheckSquare,
  Square
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { NoteWithProject } from './types';

interface VectorDocumentsTabProps {
  notes: NoteWithProject[];
  onRefresh: () => Promise<void>;
}

const VectorDocumentsTab: React.FC<VectorDocumentsTabProps> = ({ notes, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [embeddingFilter, setEmbeddingFilter] = useState<'all' | 'embedded' | 'missing'>('all');
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const hasEmbedding = note.embedding && (
      typeof note.embedding === 'string' ? note.embedding.trim() !== '' : note.embedding.length > 0
    );
    const matchesFilter = embeddingFilter === 'all' || 
                         (embeddingFilter === 'embedded' && hasEmbedding) ||
                         (embeddingFilter === 'missing' && !hasEmbedding);
    
    return matchesSearch && matchesFilter;
  });

  const handleSelectNote = (noteId: string, checked: boolean) => {
    const newSelected = new Set(selectedNotes);
    if (checked) {
      newSelected.add(noteId);
    } else {
      newSelected.delete(noteId);
    }
    setSelectedNotes(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedNotes.size === filteredNotes.length) {
      setSelectedNotes(new Set());
    } else {
      setSelectedNotes(new Set(filteredNotes.map(note => note.id)));
    }
  };

  const handleBatchGenerate = async () => {
    if (selectedNotes.size === 0) {
      toast.error('Please select notes to generate embeddings for');
      return;
    }

    setIsGenerating(true);
    try {
      const selectedNotesArray = Array.from(selectedNotes);
      
      for (const noteId of selectedNotesArray) {
        try {
          const { error } = await supabase.functions.invoke('generate-embeddings', {
            body: { noteId }
          });

          if (error) {
            console.error(`Error generating embedding for note ${noteId}:`, error);
            toast.error(`Failed to generate embedding for note ${noteId}`);
          }
        } catch (error) {
          console.error(`Exception generating embedding for note ${noteId}:`, error);
          toast.error(`Failed to generate embedding for note ${noteId}`);
        }
      }

      toast.success(`Generated embeddings for ${selectedNotesArray.length} notes`);
      setSelectedNotes(new Set());
      await onRefresh();
    } catch (error) {
      console.error('Error in batch generation:', error);
      toast.error('Failed to generate embeddings');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateEmbedding = async (noteId: string) => {
    try {
      const { error } = await supabase.functions.invoke('generate-embeddings', {
        body: { noteId }
      });

      if (error) {
        toast.error('Failed to regenerate embedding');
        return;
      }

      toast.success('Embedding regenerated successfully');
      await onRefresh();
    } catch (error) {
      console.error('Error regenerating embedding:', error);
      toast.error('Failed to regenerate embedding');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Document Management</CardTitle>
          <CardDescription>Manage vector embeddings for your notes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={embeddingFilter} onValueChange={(value: 'all' | 'embedded' | 'missing') => setEmbeddingFilter(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by embedding" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notes</SelectItem>
                <SelectItem value="embedded">With Embeddings</SelectItem>
                <SelectItem value="missing">Missing Embeddings</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={onRefresh} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          {filteredNotes.length > 0 && (
            <div className="flex items-center gap-4 mb-4 p-4 bg-muted rounded-lg">
              <Button
                onClick={handleSelectAll}
                variant="outline"
                size="sm"
              >
                {selectedNotes.size === filteredNotes.length ? (
                  <>
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Square className="mr-2 h-4 w-4" />
                    Select All
                  </>
                )}
              </Button>

              {selectedNotes.size > 0 && (
                <Button
                  onClick={handleBatchGenerate}
                  disabled={isGenerating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  {isGenerating ? 'Generating...' : `Generate Embeddings (${selectedNotes.size})`}
                </Button>
              )}

              <span className="text-sm text-muted-foreground">
                {selectedNotes.size} of {filteredNotes.length} selected
              </span>
            </div>
          )}

          <div className="space-y-2">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No notes found matching your criteria
              </div>
            ) : (
              filteredNotes.map((note) => {
                const hasEmbedding = note.embedding && (
                  typeof note.embedding === 'string' ? note.embedding.trim() !== '' : note.embedding.length > 0
                );
                return (
                  <div key={note.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50">
                    <Checkbox
                      checked={selectedNotes.has(note.id)}
                      onCheckedChange={(checked) => handleSelectNote(note.id, checked as boolean)}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{note.title}</h3>
                        <Badge variant={hasEmbedding ? "default" : "secondary"}>
                          {hasEmbedding ? "Embedded" : "Missing"}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground truncate">
                        {note.content.substring(0, 100)}...
                      </p>
                      
                      {note.projects && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Project: {note.projects.title}
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={() => handleRegenerateEmbedding(note.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Zap className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VectorDocumentsTab;
