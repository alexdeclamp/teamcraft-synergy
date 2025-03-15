import React from 'react';
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

interface ProjectNotesProps {
  projectId: string;
}

const ProjectNotes: React.FC<ProjectNotesProps> = ({ projectId }) => {
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

  const renderNotesList = () => {
    if (loading) {
      return <NotesLoading />;
    }
    
    if (notes.length === 0) {
      return <EmptyNotesList onCreateNote={handleOpenCreateDialog} />;
    }
    
    return (
      <>
        <div className="mb-6">
          <TagFilter 
            allTags={allTags} 
            activeTag={activeTag} 
            setActiveTag={setActiveTag} 
          />
          <div className="mt-4 flex justify-end">
            <Button onClick={handleOpenCreateDialog} className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" />
              New Note
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {notes.map(note => (
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
            />
          ))}
        </div>
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
