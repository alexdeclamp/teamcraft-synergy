
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  CalendarDays, 
  Clock, 
  Edit, 
  FileText, 
  MoreHorizontal, 
  Plus, 
  Settings, 
  Trash2, 
  UserPlus, 
  Users
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProjectCardProps } from '@/components/ProjectCard';
import { toast } from 'sonner';

// Role types for project members
type Role = 'owner' | 'admin' | 'member' | 'viewer';

interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

const Project = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectCardProps | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - this would come from Supabase in a real app
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock project data
        const mockProject: ProjectCardProps = {
          id: id || '1',
          title: 'Website Redesign',
          description: 'Complete overhaul of the company website with new design system and improved user experience. Implementation of new brand guidelines and updated content strategy.',
          createdAt: '2023-09-15T12:00:00Z',
          updatedAt: '2023-09-20T10:30:00Z',
          status: 'active',
          memberCount: 5,
        };
        
        // Mock members data
        const mockMembers: ProjectMember[] = [
          {
            id: '1',
            name: 'Alex Johnson',
            email: 'alex@example.com',
            role: 'owner',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          },
          {
            id: '2',
            name: 'Sarah Miller',
            email: 'sarah@example.com',
            role: 'admin',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          },
          {
            id: '3',
            name: 'David Chen',
            email: 'david@example.com',
            role: 'member',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          },
          {
            id: '4',
            name: 'Emily Wilson',
            email: 'emily@example.com',
            role: 'member',
          },
          {
            id: '5',
            name: 'Michael Brown',
            email: 'michael@example.com',
            role: 'viewer',
            avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          },
        ];
        
        setProject(mockProject);
        setMembers(mockMembers);
      } catch (error) {
        console.error("Error fetching project data:", error);
        toast.error("Failed to load project data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectData();
  }, [id]);
  
  const getRoleBadgeStyles = (role: Role) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'member':
        return 'bg-green-100 text-green-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return '';
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-muted rounded-md mx-auto mb-4"></div>
          <div className="h-4 w-32 bg-muted rounded-md mx-auto"></div>
        </div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Project not found</h2>
        <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12 animate-fade-in">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={`
                  font-normal 
                  ${project.status === 'active' ? 'bg-green-100 text-green-800' : 
                   project.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                   'bg-gray-100 text-gray-800'}
                `}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Project ID: {project.id}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <p className="text-muted-foreground mt-1 max-w-3xl">
                {project.description}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => toast.info("Invite member feature coming soon")}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit project
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Project settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-1" />
              <span>Created: {formatDate(project.createdAt)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>Last updated: {formatDate(project.updatedAt)}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{project.memberCount} members</span>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
                <CardDescription>
                  Key information and resources for this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  This is where you'll find project details, resources, and updates. 
                  Content for this section will be customizable based on your needs.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Recent Activity</h3>
                    <div className="space-y-3">
                      {[1, 2, 3].map((_, i) => (
                        <div key={i} className="flex items-start space-x-3 p-3 rounded-md bg-accent/50">
                          <div className="flex-shrink-0">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Activity item {i + 1}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Key Resources</h3>
                    <div className="space-y-3">
                      <div className="flex justify-center items-center p-6 border border-dashed rounded-md">
                        <div className="text-center">
                          <Plus className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">Add resources to your project</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Project Members</CardTitle>
                  <CardDescription>
                    People with access to this project
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => toast.info("Add member feature coming soon")}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.map((member) => (
                    <div 
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-md hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          {member.avatar && <AvatarImage src={member.avatar} alt={member.name} />}
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className={getRoleBadgeStyles(member.role)}>
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </Badge>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Member options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[180px]">
                            <DropdownMenuLabel>Member Actions</DropdownMenuLabel>
                            <DropdownMenuItem>Change role</DropdownMenuItem>
                            <DropdownMenuItem>Transfer ownership</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              Remove from project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
                <CardDescription>
                  Manage project configuration and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Project settings will be implemented in a future update. 
                  Here you'll be able to configure project details, permissions, and integrations.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Project;
