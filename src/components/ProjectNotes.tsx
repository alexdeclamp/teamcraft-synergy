
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Edit, Trash2, FileText, Loader2, User, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Note {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  project_id: string;
  creator_name?: string;
  creator_avatar?: string;
}

interface ProjectNotesProps {
  projectId: string;
}

const ProjectNotes: React.FC<ProjectNotesProps> = ({ projectId }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [projectId]);

  const fetchNotes = async () => {
    if (!projectId || !user) return;

    try {
      setLoading(true);
      
      // Fetch notes with their creators
      const { data: notesData, error: notesError } = await supabase
        .from('project_notes')
        .select('*')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false });

      if (notesError) throw notesError;
      
      // Get unique user IDs to fetch profiles
      const userIds = [...new Set(notesData?.map(note => note.user_id) || [])];
      
      let profiles: any[] = [];
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);
          
        if (profilesError) throw profilesError;
        profiles = profilesData || [];
      }
      
      // Merge notes with creator info
      const notesWithCreators = notesData?.map(note => {
        const creator = profiles.find(profile => profile.id === note.user_id);
        return {
          ...note,
          creator_name: creator?.full_name || 'Unknown User',
          creator_avatar: creator?.avatar_url,
        };
      }) || [];

      setNotes(notesWithCreators);
    } catch (error: any) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!title.trim() || !projectId || !user) {
      toast.error('Please enter a title for your note');
      return;
    }

    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('project_notes')
        .insert({
          title,
          content,
          project_id: projectId,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setNotes([data, ...notes]);
      setIsCreateOpen(false);
      setTitle('');
      setContent('');
      toast.success('Note created successfully');
    } catch (error: any) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    } finally {
      setSaving(false);
    }
  };

  const handleEditNote = async () => {
    if (!title.trim() || !currentNote || !user) {
      toast.error('Please enter a title for your note');
      return;
    }

    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('project_notes')
        .update({
          title,
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentNote.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setNotes(notes.map(note => note.id === data.id ? data : note));
      setIsEditOpen(false);
      setTitle('');
      setContent('');
      setCurrentNote(null);
      toast.success('Note updated successfully');
    } catch (error: any) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!noteId || !user) return;

    const confirmed = window.confirm('Are you sure you want to delete this note?');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('project_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotes(notes.filter(note => note.id !== noteId));
      toast.success('Note deleted successfully');
    } catch (error: any) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const openEditDialog = (note: Note) => {
    setCurrentNote(note);
    setTitle(note.title);
    setContent(note.content || '');
    setIsEditOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleOpenCreateDialog = () => {
    setTitle('');
    setContent('');
    setIsCreateOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Project Notes</h2>
        <Button 
          onClick={handleOpenCreateDialog}
          className="flex items-center gap-1"
        >
          <PlusCircle className="h-4 w-4" />
          New Note
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : notes.length === 0 ? (
        <Card className="bg-muted/40">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <FileText className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-center">
              No notes yet. Create your first note to get started.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleOpenCreateDialog}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create a Note
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <Card key={note.id} className="hover:bg-accent/5 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium text-lg">{note.title}</h3>
                    </div>
                    
                    <div className="text-muted-foreground text-sm mb-2 line-clamp-2">
                      {note.content || "No content"}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        <div className="flex items-center">
                          {note.creator_avatar ? (
                            <Avatar className="h-4 w-4 mr-1">
                              <AvatarImage src={note.creator_avatar} alt={note.creator_name} />
                              <AvatarFallback>
                                {note.creator_name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ) : null}
                          <span>{note.creator_name}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{formatDate(note.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {note.user_id === user?.id && (
                    <div className="flex space-x-1 ml-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => openEditDialog(note)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Note Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
            <DialogDescription>
              Add a new note to this project. Notes are visible to all project members.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter note title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Enter note content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNote} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              Make changes to your note.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditNote} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectNotes;
