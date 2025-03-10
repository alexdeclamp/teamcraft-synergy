import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  PlusCircle, 
  Search, 
  X, 
  Tag, 
  RefreshCw, 
  Loader2, 
  Trash2,
  CheckSquare,
  Square
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import ProjectNoteCard from './project/ProjectNoteCard';
import NoteSummaryButton from './NoteSummaryButton'; 
import TagFilter from './tags/TagFilter';
import TagInput from './tags/TagInput';

interface ProjectNotesProps {
  projectId: string;
}

const ProjectNotes: React.FC<ProjectNotesProps> = ({ projectId }) => {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [isFetchingNotes, setIsFetchingNotes] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const { user } = useAuth();

  const fetchNotes = async () => {
    if (!user) return;
    
    try {
      setIsFetchingNotes(true);
      
      let query = supabase
        .from('project_notes')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setNotes(data || []);
      
      const uniqueTags = Array.from(
        new Set(
          data
            ?.filter(note => note.tags && note.tags.length)
            .flatMap(note => note.tags)
        )
      );
      
      setAllTags(uniqueTags as string[]);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
      setIsFetchingNotes(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [projectId, user]);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    
    try {
      setIsCreatingNote(true);
      
      const { data, error } = await supabase
        .from('project_notes')
        .insert({
          title,
          content,
          project_id: projectId,
          user_id: user?.id,
          tags
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      toast.success('Note created successfully');
      setTitle('');
      setContent('');
      setTags([]);
      fetchNotes();
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    } finally {
      setIsCreatingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('project_notes')
        .delete()
        .eq('id', noteId);
      
      if (error) {
        throw error;
      }
      
      toast.success('Note deleted successfully');
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedNotes([]); // Clear selections when toggling mode
  };

  const handleToggleNoteSelection = (noteId: string) => {
    setSelectedNotes(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId) 
        : [...prev, noteId]
    );
  };

  const handleSelectAllNotes = () => {
    if (selectedNotes.length === filteredNotes.length) {
      setSelectedNotes([]);
    } else {
      setSelectedNotes(filteredNotes.map(note => note.id));
    }
  };

  const handleDeleteSelectedNotes = async () => {
    if (selectedNotes.length === 0) {
      toast.warning('No notes selected');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedNotes.length} note(s)?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('project_notes')
        .delete()
        .in('id', selectedNotes);
      
      if (error) {
        throw error;
      }
      
      toast.success(`Successfully deleted ${selectedNotes.length} note(s)`);
      setSelectedNotes([]);
      fetchNotes();
    } catch (error) {
      console.error('Error deleting notes:', error);
      toast.error('Failed to delete selected notes');
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchTerm === '' || 
      note.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      note.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      (note.tags && selectedTags.every(tag => note.tags.includes(tag)));
    
    return matchesSearch && matchesTags;
  });

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-4 space-y-4">
          <form onSubmit={handleCreateNote} className="space-y-4">
            <div>
              <Input
                placeholder="Note title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mb-2"
              />
              <div className="w-full">
                <textarea
                  placeholder="Note content..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full min-h-[100px] p-2 border rounded-md"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <div className="flex-grow">
                <TagInput 
                  tags={tags} 
                  setTags={setTags} 
                  availableTags={allTags} 
                />
              </div>
              <Button type="submit" disabled={isCreatingNote}>
                {isCreatingNote ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Note
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <div className="relative w-full sm:w-96">
            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            {searchTerm && (
              <button 
                className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={fetchNotes} 
              disabled={isFetchingNotes}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isFetchingNotes ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button 
              size="sm" 
              variant={isSelectionMode ? "secondary" : "outline"}
              onClick={handleToggleSelectionMode}
            >
              <CheckSquare className="h-4 w-4 mr-1" />
              {isSelectionMode ? 'Exit Selection' : 'Select Multiple'}
            </Button>
            
            {isSelectionMode && (
              <>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleSelectAllNotes}
                >
                  {selectedNotes.length === filteredNotes.length ? 
                    'Deselect All' : 'Select All'}
                </Button>
                
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={handleDeleteSelectedNotes}
                  disabled={selectedNotes.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Selected
                </Button>
              </>
            )}
          </div>
        </div>
        
        {allTags.length > 0 && (
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <TagFilter 
              allTags={allTags} 
              selectedTags={selectedTags} 
              onTagSelect={(tag) => {
                setSelectedTags(prev => 
                  prev.includes(tag) 
                    ? prev.filter(t => t !== tag) 
                    : [...prev, tag]
                );
              }} 
            />
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No notes found. Create your first note!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredNotes.map((note) => (
            <div key={note.id} className="flex items-start gap-2">
              {isSelectionMode && (
                <div 
                  className="p-2 cursor-pointer mt-2"
                  onClick={() => handleToggleNoteSelection(note.id)}
                >
                  {selectedNotes.includes(note.id) ? (
                    <CheckSquare className="h-5 w-5 text-primary" />
                  ) : (
                    <Square className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              )}
              <div className={`flex-grow ${isSelectionMode ? 'cursor-pointer' : ''}`} onClick={() => {
                if (isSelectionMode) {
                  handleToggleNoteSelection(note.id);
                }
              }}>
                <ProjectNoteCard
                  note={note}
                  onDelete={handleDeleteNote}
                  onUpdate={fetchNotes}
                  projectId={projectId}
                  showSummaryButton
                  isSelectionMode={isSelectionMode}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectNotes;
