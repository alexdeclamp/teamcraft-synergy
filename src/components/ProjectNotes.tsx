import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, FileText, Loader2, User, Clock, Tag, Hash, X, Bold, Italic, Underline } from 'lucide-react';
import { toast } from 'sonner';
import NoteSummaryButton from './NoteSummaryButton';
import RegenerateMetadataButton from './note/RegenerateMetadataButton';

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
  tags?: string[];
}

interface ProjectNotesProps {
  projectId: string;
}

const ProjectNotes: React.FC<ProjectNotesProps> = ({
  projectId
}) => {
  const {
    user
  } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [aiModel, setAiModel] = useState<'claude' | 'openai'>('claude');

  useEffect(() => {
    fetchNotes();
  }, [projectId, activeTag]);

  const fetchNotes = async () => {
    if (!projectId || !user) return;
    try {
      setLoading(true);
      let query = supabase.from('project_notes').select('*').eq('project_id', projectId);
      if (activeTag) {
        query = query.contains('tags', [activeTag]);
      }
      const {
        data: notesData,
        error: notesError
      } = await query.order('updated_at', {
        ascending: false
      });
      if (notesError) throw notesError;
      const userIds = [...new Set(notesData?.map(note => note.user_id) || [])];
      const tagSet = new Set<string>();
      notesData?.forEach(note => {
        if (note.tags && Array.isArray(note.tags)) {
          note.tags.forEach(tag => tagSet.add(tag));
        }
      });
      setAllTags(Array.from(tagSet));
      let profiles: any[] = [];
      if (userIds.length > 0) {
        const {
          data: profilesData,
          error: profilesError
        } = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', userIds);
        if (profilesError) throw profilesError;
        profiles = profilesData || [];
      }
      const notesWithCreators = notesData?.map(note => {
        const creator = profiles.find(profile => profile.id === note.user_id);
        return {
          ...note,
          creator_name: creator?.full_name || 'Unknown User',
          creator_avatar: creator?.avatar_url
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

  const addTag = () => {
    if (!tagInput.trim() || tags.includes(tagInput.trim())) {
      return;
    }
    setTags([...tags, tagInput.trim()]);
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const handleRegenerateTitle = (newTitle: string) => {
    setTitle(newTitle);
    toast.success('Title regenerated successfully');
  };

  const handleRegenerateTags = (newTags: string[]) => {
    setTags(newTags);
    toast.success('Tags regenerated successfully');
  };

  const handleRegenerateBoth = (data: {
    title: string;
    tags: string[];
  }) => {
    setTitle(data.title);
    setTags(data.tags);
    toast.success('Title and tags regenerated successfully');
  };

  const handleCreateNote = async () => {
    if (!title.trim() || !projectId || !user) {
      toast.error('Please enter a title for your note');
      return;
    }
    try {
      setSaving(true);
      const {
        data,
        error
      } = await supabase.from('project_notes').insert({
        title,
        content,
        project_id: projectId,
        user_id: user.id,
        tags: tags.length > 0 ? tags : null
      }).select().single();
      if (error) throw error;
      const newNote = {
        ...data,
        creator_name: user.user_metadata?.full_name || 'Unknown User',
        creator_avatar: user.user_metadata?.avatar_url
      };
      setNotes([newNote, ...notes]);
      setIsCreateOpen(false);
      resetForm();
      toast.success('Note created successfully');
      const newTags = tags.filter(tag => !allTags.includes(tag));
      if (newTags.length > 0) {
        setAllTags([...allTags, ...newTags]);
      }
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
      const {
        data,
        error
      } = await supabase.from('project_notes').update({
        title,
        content,
        updated_at: new Date().toISOString(),
        tags: tags.length > 0 ? tags : null
      }).eq('id', currentNote.id).eq('user_id', user.id).select().single();
      if (error) throw error;
      const updatedNote = {
        ...data,
        creator_name: currentNote.creator_name,
        creator_avatar: currentNote.creator_avatar
      };
      setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note));
      setIsEditOpen(false);
      resetForm();
      toast.success('Note updated successfully');
      const newTags = tags.filter(tag => !allTags.includes(tag));
      if (newTags.length > 0) {
        setAllTags([...allTags, ...newTags]);
      }
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
      const {
        error
      } = await supabase.from('project_notes').delete().eq('id', noteId).eq('user_id', user.id);
      if (error) throw error;
      setNotes(notes.filter(note => note.id !== noteId));
      toast.success('Note deleted successfully');
      const remainingTags = new Set<string>();
      notes.filter(note => note.id !== noteId).forEach(note => {
        if (note.tags) {
          note.tags.forEach(tag => remainingTags.add(tag));
        }
      });
      setAllTags(Array.from(remainingTags));
    } catch (error: any) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const openEditDialog = (note: Note) => {
    setCurrentNote(note);
    setTitle(note.title);
    setContent(note.content || '');
    setTags(note.tags || []);
    setIsEditOpen(true);
  };

  const openViewDialog = (note: Note) => {
    setCurrentNote(note);
    setIsViewOpen(true);
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
    resetForm();
    setIsCreateOpen(true);
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setTags([]);
    setTagInput('');
    setCurrentNote(null);
  };

  const applyFormatting = (type: 'bold' | 'italic' | 'underline') => {
    const textarea = document.getElementById(isEditOpen ? 'edit-content' : 'content') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    if (start === end) {
      let formattedText = '';
      let placeholder = 'text';
      switch (type) {
        case 'bold':
          formattedText = `**${placeholder}**`;
          break;
        case 'italic':
          formattedText = `*${placeholder}*`;
          break;
        case 'underline':
          formattedText = `__${placeholder}__`;
          break;
      }
      const newContent = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      setContent(newContent);
      setTimeout(() => {
        textarea.focus();
        const placeholderStart = start + (type === 'bold' || type === 'underline' ? 2 : 1);
        textarea.setSelectionRange(placeholderStart, placeholderStart + placeholder.length);
      }, 0);
    } else {
      let formattedText = '';
      switch (type) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `*${selectedText}*`;
          break;
        case 'underline':
          formattedText = `__${selectedText}__`;
          break;
      }
      const newContent = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      setContent(newContent);
      const newCursorPos = start + formattedText.length;
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  const renderFormattedText = (text: string) => {
    if (!text) return "No content provided.";
    
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      let formattedLine = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/__(.*?)__/g, '<u>$1</u>')
        .replace(/^\* /, '• ');
      
      if (line.trim().match(/^#{1,6}\s/)) {
        const level = line.trim().match(/^#+/)[0].length;
        let fontSize;
        switch(level) {
          case 1: fontSize = "1.25rem"; break;
          case 2: fontSize = "1.15rem"; break;
          case 3: fontSize = "1.1rem"; break;
          default: fontSize = "1rem";
        }
        
        return (
          <div 
            key={index} 
            className="font-bold mb-2 mt-3" 
            style={{fontSize}}
            dangerouslySetInnerHTML={{__html: formattedLine.replace(/^#+\s*/, '')}}
          />
        );
      }
      
      if (line.trim().match(/^[-*•]\s/)) {
        return (
          <div key={index} className="flex ml-4 my-1">
            <span className="mr-2">•</span>
            <span dangerouslySetInnerHTML={{__html: formattedLine.replace(/^[-*•]\s/, '')}} />
          </div>
        );
      }
      
      return (
        <div key={index} className="my-1" dangerouslySetInnerHTML={{__html: formattedLine}} />
      );
    });
  };

  return <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        
        <Button onClick={handleOpenCreateDialog} className="flex items-center gap-1">
          <PlusCircle className="h-4 w-4" />
          New Note
        </Button>
      </div>

      {allTags.length > 0 && <div className="flex flex-wrap items-center gap-2 mb-4 bg-accent/10 p-3 rounded-md">
          <Tag className="h-4 w-4 text-muted-foreground mr-1" />
          <span className="text-sm font-medium mr-2">Filter by tag:</span>
          <Button variant={activeTag === null ? "secondary" : "outline"} size="sm" onClick={() => setActiveTag(null)} className="h-7 text-xs">
            All
          </Button>
          {allTags.map(tag => <Button key={tag} variant={activeTag === tag ? "secondary" : "outline"} size="sm" onClick={() => setActiveTag(activeTag === tag ? null : tag)} className="h-7 text-xs">
              #{tag}
            </Button>)}
        </div>}

      {loading ? <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div> : notes.length === 0 ? <Card className="bg-muted/40">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <FileText className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-center">
              No notes yet. Create your first note to get started.
            </p>
            <Button variant="outline" className="mt-4" onClick={handleOpenCreateDialog}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create a Note
            </Button>
          </CardContent>
        </Card> : <div className="space-y-2">
          {notes.map(note => <Card key={note.id} className="hover:bg-accent/5 transition-colors cursor-pointer" onClick={() => openViewDialog(note)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium text-lg">{note.title}</h3>
                    </div>
                    
                    <div className="text-muted-foreground text-sm mb-2 line-clamp-2">
                      {note.content ? (
                        <div>
                          {renderFormattedText(note.content)}
                        </div>
                      ) : "No content"}
                    </div>
                    
                    {note.tags && note.tags.length > 0 && <div className="flex flex-wrap gap-1 mb-2">
                        {note.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs bg-accent/20" onClick={e => {
                  e.stopPropagation();
                  setActiveTag(tag === activeTag ? null : tag);
                }}>
                            #{tag}
                          </Badge>)}
                      </div>}
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        <div className="flex items-center">
                          {note.creator_avatar ? <Avatar className="h-4 w-4 mr-1">
                              <AvatarImage src={note.creator_avatar} alt={note.creator_name} />
                              <AvatarFallback>
                                {note.creator_name?.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar> : null}
                          <span>{note.creator_name}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{formatDate(note.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {note.user_id === user?.id && <div className="flex space-x-1 ml-2" onClick={e => e.stopPropagation()}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <NoteSummaryButton noteId={note.id} noteTitle={note.title} noteContent={note.content} />
                          </TooltipTrigger>
                          <TooltipContent>Generate Summary</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => {
                      e.stopPropagation();
                      openEditDialog(note);
                    }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={e => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>}
                </div>
              </CardContent>
            </Card>)}
        </div>}

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto">
          {currentNote && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <DialogTitle className="pr-8">{currentNote.title}</DialogTitle>
                  <div className="flex space-x-1">
                    {currentNote.user_id === user?.id && <>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                    setIsViewOpen(false);
                    setTimeout(() => openEditDialog(currentNote), 100);
                  }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => {
                    setIsViewOpen(false);
                    setTimeout(() => handleDeleteNote(currentNote.id), 100);
                  }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    <div className="flex items-center">
                      {currentNote.creator_avatar ? <Avatar className="h-5 w-5 mr-1">
                          <AvatarImage src={currentNote.creator_avatar} alt={currentNote.creator_name} />
                          <AvatarFallback>
                            {currentNote.creator_name?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar> : null}
                      <span>{currentNote.creator_name}</span>
                    </div>
                  </div>
                  <span>•</span>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{formatDate(currentNote.updated_at)}</span>
                  </div>
                </div>
              </DialogHeader>
              
              {currentNote.tags && currentNote.tags.length > 0 && <div className="flex flex-wrap gap-1 mt-2">
                  {currentNote.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs bg-accent/20">
                      #{tag}
                    </Badge>)}
                </div>}
              
              <div className="mt-4 whitespace-pre-wrap">
                {renderFormattedText(currentNote.content || '')}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
            <DialogDescription>
              Add a new note to this project. Notes are visible to all project members.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="title">Title</Label>
                <RegenerateMetadataButton noteContent={content} onRegenerateTitle={handleRegenerateTitle} onRegenerateTags={handleRegenerateTags} onRegenerateBoth={handleRegenerateBoth} model={aiModel} onModelChange={setAiModel} />
              </div>
              <Input id="title" placeholder="Enter note title" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="content">Content</Label>
                <div className="flex space-x-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => applyFormatting('bold')}>
                          <Bold className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Bold</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => applyFormatting('italic')}>
                          <Italic className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Italic</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => applyFormatting('underline')}>
                          <Underline className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Underline</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <Textarea id="content" placeholder="Enter note content" value={content} onChange={e => setContent(e.target.value)} className="min-h-[200px] font-mono" />
              <div className="text-xs text-muted-foreground">
                Use **bold**, *italic*, or __underline__ to format your text.
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma or enter to add)</Label>
              <div className="flex items-center space-x-2">
                <Input id="tags" placeholder="Add tags..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagInputKeyDown} />
                <Button type="button" variant="outline" size="sm" onClick={addTag} disabled={!tagInput.trim()}>
                  Add
                </Button>
              </div>
              {tags.length > 0 && <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map(tag => <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      #{tag}
                      <button onClick={() => removeTag(tag)} className="ml-1 h-3 w-3 rounded-full flex items-center justify-center hover:bg-accent">
                        <X className="h-2 w-2" />
                      </button>
                    </Badge>)}
                </div>}
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

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              Make changes to your note.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="edit-title">Title</Label>
                <RegenerateMetadataButton noteContent={content} onRegenerateTitle={handleRegenerateTitle} onRegenerateTags={handleRegenerateTags} onRegenerateBoth={handleRegenerateBoth} model={aiModel} onModelChange={setAiModel} />
              </div>
              <Input id="edit-title" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="edit-content">Content</Label>
                <div className="flex space-x-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => applyFormatting('bold')}>
                          <Bold className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Bold</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => applyFormatting('italic')}>
                          <Italic className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Italic</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => applyFormatting('underline')}>
                          <Underline className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Underline</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <Textarea id="edit-content" value={content} onChange={e => setContent(e.target.value)} className="min-h-[200px] font-mono" />
              <div className="text-xs text-muted-foreground">
                Use **bold**, *italic*, or __underline__ to format your text.
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-tags">Tags (comma or enter to add)</Label>
              <div className="flex items-center space-x-2">
                <Input id="edit-tags" placeholder="Add tags..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagInputKeyDown} />
                <Button type="button" variant="outline" size="sm" onClick={addTag} disabled={!tagInput.trim()}>
                  Add
                </Button>
              </div>
              {tags.length > 0 && <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map(tag => <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      #{tag}
                      <button onClick={() => removeTag(tag)} className="ml-1 h-3 w-3 rounded-full flex items-center justify-center hover:bg-accent">
                        <X className="h-2 w-2" />
                      </button>
                    </Badge>)}
                </div>}
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
    </div>;
};

export default ProjectNotes;
