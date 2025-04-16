
import React from 'react';
import { Note } from './types';
import NotesCard from './NotesCard';

interface NotesListProps {
  notes: Note[];
  userId?: string;
  activeTag: string | null;
  setActiveTag: (tag: string | null) => void;
  onView: (note: Note) => void;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  formatDate?: (dateString: string) => string;
}

const NotesList: React.FC<NotesListProps> = ({
  notes,
  userId,
  activeTag,
  setActiveTag,
  onView,
  onEdit,
  onDelete,
  formatDate
}) => {
  if (notes.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-muted-foreground">No notes match your search</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white rounded-md shadow-sm">
      {notes.map((note, index) => (
        <NotesCard
          key={note.id}
          note={note}
          userId={userId}
          activeTag={activeTag}
          setActiveTag={setActiveTag}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          formatDate={formatDate}
          isLast={index === notes.length - 1}
        />
      ))}
    </div>
  );
};

export default NotesList;
