
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, PlusCircle } from 'lucide-react';

interface EmptyNotesListProps {
  onCreateNote: () => void;
}

const EmptyNotesList: React.FC<EmptyNotesListProps> = ({ onCreateNote }) => {
  return (
    <Card className="bg-gradient-to-b from-muted/30 to-muted/50 border-dashed border-2">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          <FileText className="h-14 w-14 text-primary/80" />
        </div>
        <h3 className="text-lg font-medium text-slate-700 mb-2">No notes yet</h3>
        <p className="text-muted-foreground text-center max-w-md mb-4">
          Create your first note to capture ideas, information, and updates related to this project.
        </p>
        <Button className="mt-2 animate-pulse" onClick={onCreateNote}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Your First Note
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyNotesList;
