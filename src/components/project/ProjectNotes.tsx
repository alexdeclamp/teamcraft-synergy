
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ProjectNoteCard from './ProjectNoteCard';

interface ProjectNotesProps {
  notes: any[];
  projectId: string;
  onNoteUpdated?: () => void;
}

const ProjectNotes: React.FC<ProjectNotesProps> = ({ notes, projectId, onNoteUpdated }) => {
  return (
    <div className="space-y-4">
      {/* Removed the "Project Notes" heading from here */}
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {notes && notes.length > 0 ? (
            notes.map((note) => (
              <ProjectNoteCard
                key={note.id}
                note={note}
                projectId={projectId}
                onNoteUpdated={onNoteUpdated}
              />
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              No notes found. Add your first note to get started.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ProjectNotes;
