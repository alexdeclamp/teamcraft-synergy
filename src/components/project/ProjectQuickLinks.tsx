
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import {
  Bookmark,
  Image,
  MessageSquare,
  Users,
} from 'lucide-react';

interface ProjectQuickLinksProps {
  onTabChange: (tab: string) => void;
}

const ProjectQuickLinks = ({ onTabChange }: ProjectQuickLinksProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Bookmark className="h-5 w-5 mr-2 text-primary" />
          Resources & Quick Links
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="h-auto p-4 justify-start items-start flex-col text-left"
            onClick={() => onTabChange('images')}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-2">
              <Image className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Image Gallery</p>
              <p className="text-xs text-muted-foreground mt-1">Browse and manage project images</p>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto p-4 justify-start items-start flex-col text-left"
            onClick={() => onTabChange('chat')}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-2">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">AI Assistant</p>
              <p className="text-xs text-muted-foreground mt-1">Chat with AI about your project</p>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto p-4 justify-start items-start flex-col text-left"
            onClick={() => onTabChange('members')}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Team Members</p>
              <p className="text-xs text-muted-foreground mt-1">Manage project collaborators</p>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectQuickLinks;
