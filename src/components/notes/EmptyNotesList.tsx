
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, PlusCircle } from 'lucide-react';

interface EmptyNotesListProps {
  onCreateNote: () => void;
}

const EmptyNotesList: React.FC<EmptyNotesListProps> = ({ onCreateNote }) => {
  return (
    <Card className="bg-muted/40">
      <CardContent className="flex flex-col items-center justify-center py-10">
        <FileText className="h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-muted-foreground text-center">
          No notes yet. Create your first note to get started.
        </p>
        <Button variant="outline" className="mt-4" onClick={onCreateNote}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create a Note
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyNotesList;
