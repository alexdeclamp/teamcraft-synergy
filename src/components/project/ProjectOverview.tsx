
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Plus,
  StickyNote,
  Info,
  Image,
  MessageSquare,
} from 'lucide-react';

interface ProjectMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface ProjectOverviewProps {
  project: {
    description: string | null;
    created_at: string;
  };
  members: ProjectMember[];
  userRole: string | null;
  onAddMember: () => void;
  onTabChange: (tab: string) => void;
}

const ProjectOverview = ({
  project,
  members,
  userRole,
  onAddMember,
  onTabChange,
}: ProjectOverviewProps) => {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Info className="h-5 w-5 mr-2 text-primary" />
          Project Overview
        </CardTitle>
        <CardDescription>
          Key information about this project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-accent/30 rounded-md">
            <h3 className="font-medium mb-2">About this project</h3>
            <p className="text-sm text-muted-foreground">
              {project?.description || "This project contains visual assets and collaborative resources for the team."}
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Project Team</h3>
            <div className="flex items-center space-x-2">
              {members.slice(0, 5).map((member) => (
                <Avatar key={member.id} className="border-2 border-background">
                  {member.avatar && <AvatarImage src={member.avatar} alt={member.name} />}
                  <AvatarFallback>
                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              
              {members.length > 5 && (
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted text-sm font-medium">
                  +{members.length - 5}
                </div>
              )}
              
              {userRole === 'owner' && (
                <Button 
                  variant="outline" 
                  size="icon"
                  className="w-10 h-10 rounded-full"
                  onClick={onAddMember}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Status</h3>
            <div className="flex space-x-2">
              <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
              <Badge variant="outline" className="font-normal">
                Created {formatDate(project?.created_at || '')}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onTabChange('notes')}>
                <StickyNote className="h-4 w-4 mr-2" />
                View Notes
              </Button>
              <Button size="sm" variant="outline" onClick={() => onTabChange('images')}>
                <Image className="h-4 w-4 mr-2" />
                Manage Images
              </Button>
              <Button size="sm" variant="outline" onClick={() => onTabChange('chat')}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Project Chat
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectOverview;
