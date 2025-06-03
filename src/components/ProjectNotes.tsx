
import React, { useState } from 'react';
import { useProjectNotes } from '@/hooks/useProjectNotes';
import { useNoteForm } from '@/hooks/useNoteForm';
import { useNotesSearch } from '@/hooks/notes/useNotesSearch';
import { useNotesDialogCleanup } from '@/hooks/notes/useNotesDialogCleanup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmptyNotesList from './notes/EmptyNotesList';
import NotesLoading from './notes/NotesLoading';
import NotesToolbar from './notes/NotesToolbar';
import NotesList from './notes/NotesList';
import NotesDialogsContainer from './notes/NotesDialogsContainer';
import SemanticSearch from './notes/SemanticSearch';
import EmbeddingManager from './notes/EmbeddingManager';
import SimilarNotes from './notes/SimilarNotes';

interface ProjectNotesProps {
  projectId: string;
}

const ProjectNotes: React.FC<ProjectNotesProps> = ({ projectId }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  
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
    handleOpenCreateDialog,
    resetForm
  } = useNoteForm(projectId, notes, setNotes, allTags, setAllTags);

  const { filteredNotes } = useNotesSearch(notes, searchQuery);

  const {
    handleCloseViewDialog,
    handleCloseCreateDialog,
    handleCloseEditDialog
  } = useNotesDialogCleanup({
    isCreateOpen,
    isEditOpen,
    isViewOpen,
    resetForm
  });

  const handleNoteSelect = (note) => {
    setSelectedNote(note);
    openViewDialog(note);
  };

  if (loading) {
    return <NotesLoading />;
  }

  if (notes.length === 0) {
    return <EmptyNotesList onCreateNote={handleOpenCreateDialog} />;
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="search">Semantic Search</TabsTrigger>
          <TabsTrigger value="settings">Vector Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notes" className="space-y-4">
          <NotesToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onCreateNote={handleOpenCreateDialog}
            allTags={allTags}
            activeTag={activeTag}
            setActiveTag={setActiveTag}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <NotesList
                notes={filteredNotes}
                userId={user?.id}
                activeTag={activeTag}
                setActiveTag={setActiveTag}
                onView={handleNoteSelect}
                onEdit={openEditDialog}
                onDelete={handleDeleteNote}
                formatDate={formatDate}
              />
            </div>
            
            <div className="space-y-4">
              <SimilarNotes 
                currentNote={selectedNote}
                onNoteSelect={handleNoteSelect}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="search">
          <SemanticSearch 
            projectId={projectId}
            onNoteSelect={handleNoteSelect}
          />
        </TabsContent>
        
        <TabsContent value="settings">
          <EmbeddingManager 
            notes={notes}
            projectId={projectId}
          />
        </TabsContent>
      </Tabs>

      <NotesDialogsContainer
        isCreateOpen={isCreateOpen}
        isEditOpen={isEditOpen}
        isViewOpen={isViewOpen}
        setIsCreateOpen={setIsCreateOpen}
        setIsEditOpen={setIsEditOpen}
        setIsViewOpen={setIsViewOpen}
        currentNote={currentNote}
        title={title}
        content={content}
        tagInput={tagInput}
        tags={tags}
        saving={saving}
        aiModel={aiModel}
        handleCreateNote={handleCreateNote}
        handleEditNote={handleEditNote}
        onEdit={openEditDialog}
        onDelete={handleDeleteNote}
        setTitle={setTitle}
        setContent={setContent}
        setTagInput={setTagInput}
        handleTagInputKeyDown={handleTagInputKeyDown}
        addTag={addTag}
        removeTag={removeTag}
        handleRegenerateTitle={handleRegenerateTitle}
        handleRegenerateTags={handleRegenerateTags}
        handleRegenerateBoth={handleRegenerateBoth}
        setAiModel={setAiModel}
        allTags={allTags}
        formatDate={formatDate}
        userId={user?.id}
        handleCloseViewDialog={handleCloseViewDialog}
        handleCloseCreateDialog={handleCloseCreateDialog}
        handleCloseEditDialog={handleCloseEditDialog}
      />
    </div>
  );
};

export default ProjectNotes;
