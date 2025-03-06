
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import {
  StickyNote,
  Plus,
} from 'lucide-react';

interface ProjectNoteCardProps {
  onViewNotes: () => void;
}

const ProjectNoteCard = ({ onViewNotes }: ProjectNoteCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <StickyNote className="h-5 w-5 mr-2 text-primary" />
          Project Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="p-6 border border-dashed rounded-md">
            <div className="text-center">
              <StickyNote className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground mb-2">Capture ideas and keep track of important information</p>
              <div className="flex justify-center gap-2">
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={onViewNotes}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Note
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onViewNotes}
                >
                  View Notes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectNoteCard;
