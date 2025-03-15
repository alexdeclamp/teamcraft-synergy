
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import NotesDialog from './notes/NotesDialog';
import NotesCard from './notes/NotesCard';
import TagFilter from './notes/TagFilter';
import EmptyNotesList from './notes/EmptyNotesList';
import NotesLoading from './notes/NotesLoading';
import NotesViewDialog from './notes/NotesViewDialog';
import { ContentAlert } from "@/components/ui/content-alert";
import { useProjectNotes } from '@/hooks/useProjectNotes';
import { useNoteForm } from '@/hooks/useNoteForm';
import { SearchBar } from '@/components/ui/search-bar';

interface ProjectNotesProps {
  projectId: string;
}

const ProjectNotes: React.FC<ProjectNotesProps> = ({ projectId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    notes,
    setNotes,
    loading,
    allTags,
    setAllTags,
    activeTag,
    setActiveTag,
    aiModel,
    setAiModel,
    handleDeleteNote,
    formatDate,
    user
  } = useProjectNotes(projectId);

  const {
    isCreateOpen,
    setIsCreateOpen,
    isEditOpen,
    setIsEditOpen,
    isViewOpen,
    setIsViewOpen,
    currentNote,
    title,
    setTitle,
    content,
    setContent,
    tagInput,
    setTagInput,
    tags,
    saving,
    addTag,
    removeTag,
    handleTagInputKeyDown,
    handleRegenerateTitle,
    handleRegenerateTags,
    handleRegenerateBoth,
    handleCreateNote,
    handleEditNote,
    openEditDialog,
    openViewDialog,
    handleOpenCreateDialog
  } = useNoteForm(projectId, notes, setNotes, allTags, setAllTags);

  // Filter notes based on search query
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    
    const query = searchQuery.toLowerCase().trim();
    return notes.filter(note => 
      note.title.toLowerCase().includes(query) || 
      note.content.toLowerCase().includes(query) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }, [notes, searchQuery]);

  const renderNotesList = () => {
    if (loading) {
      return <NotesLoading />;
    }
    
    if (notes.length === 0) {
      return <EmptyNotesList onCreateNote={handleOpenCreateDialog} />;
    }
    
    return (
      <>
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <SearchBar
              placeholder="Search notes..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="flex-1"
            />
            <Button onClick={handleOpenCreateDialog} className="flex items-center gap-1 shrink-0">
              <PlusCircle className="h-4 w-4" />
              New Note
            </Button>
          </div>
          
          <TagFilter 
            allTags={allTags} 
            activeTag={activeTag} 
            setActiveTag={setActiveTag} 
          />
        </div>

        {filteredNotes.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground">No notes match your search</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredNotes.map((note, index) => (
              <NotesCard
                key={note.id}
                note={note}
                userId={user?.id}
                activeTag={activeTag}
                setActiveTag={setActiveTag}
                onView={openViewDialog}
                onEdit={openEditDialog}
                onDelete={handleDeleteNote}
                formatDate={formatDate}
                isLast={index === filteredNotes.length - 1}
              />
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="space-y-4">
      <ContentAlert />
      
      {renderNotesList()}

      <NotesViewDialog
        isOpen={isViewOpen}
        setIsOpen={setIsViewOpen}
        onOpenChange={setIsViewOpen}
        note={currentNote}
        onEdit={openEditDialog}
        onDelete={handleDeleteNote}
        formatDate={formatDate}
        userId={user?.id}
      />
      
      <NotesDialog
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        type="create"
        title={title}
        content={content}
        tagInput={tagInput}
        tags={tags}
        saving={saving}
        aiModel={aiModel}
        onTitleChange={setTitle}
        onContentChange={setContent}
        onTagInputChange={setTagInput}
        onTagInputKeyDown={handleTagInputKeyDown}
        addTag={addTag}
        removeTag={removeTag}
        handleSubmit={handleCreateNote}
        handleRegenerateTitle={handleRegenerateTitle}
        handleRegenerateTags={handleRegenerateTags}
        handleRegenerateBoth={handleRegenerateBoth}
        onModelChange={setAiModel}
      />
      
      <NotesDialog
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        type="edit"
        title={title}
        content={content}
        tagInput={tagInput}
        tags={tags}
        saving={saving}
        aiModel={aiModel}
        onTitleChange={setTitle}
        onContentChange={setContent}
        onTagInputChange={setTagInput}
        onTagInputKeyDown={handleTagInputKeyDown}
        addTag={addTag}
        removeTag={removeTag}
        handleSubmit={handleEditNote}
        handleRegenerateTitle={handleRegenerateTitle}
        handleRegenerateTags={handleRegenerateTags}
        handleRegenerateBoth={handleRegenerateBoth}
        onModelChange={setAiModel}
      />
    </div>
  );
};

export default ProjectNotes;
