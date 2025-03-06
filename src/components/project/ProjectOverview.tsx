
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Info, Activity, BarChart, Plus, StickyNote, Image, MessageSquare } from 'lucide-react';

interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  avatar?: string;
}

interface ProjectOverviewProps {
  project: {
    title: string;
    description: string | null;
    created_at: string;
  };
  members: ProjectMember[];
  userRole: string | null;
  activityPercentage: number;
  daysSinceCreation: number;
  imageCount: number;
  onAddMember: () => void;
  onTabChange: (tab: string) => void;
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  project,
  members,
  userRole,
  activityPercentage,
  daysSinceCreation,
  imageCount,
  onAddMember,
  onTabChange
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="md:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <BarChart className="h-5 w-5 mr-2 text-primary" />
            Project Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Activity</span>
              <span className="font-medium">{activityPercentage}%</span>
            </div>
            <Progress value={activityPercentage} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1 border rounded-md p-3">
              <div className="text-xl font-bold text-primary">{imageCount}</div>
              <div className="text-xs text-muted-foreground">Images</div>
            </div>
            <div className="space-y-1 border rounded-md p-3">
              <div className="text-xl font-bold text-primary">{members.length}</div>
              <div className="text-xs text-muted-foreground">Members</div>
            </div>
            <div className="space-y-1 border rounded-md p-3">
              <div className="text-xl font-bold text-primary">{daysSinceCreation}</div>
              <div className="text-xs text-muted-foreground">Days active</div>
            </div>
            <div className="space-y-1 border rounded-md p-3">
              <div className="text-xl font-bold text-primary">0</div>
              <div className="text-xs text-muted-foreground">Comments</div>
            </div>
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
};

export default ProjectOverview;
