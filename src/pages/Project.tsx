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
  CardFooter,
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
  Users,
  Loader2,
  StickyNote,
  Image,
  ImageIcon,
  FileWarning,
  MessageSquare,
  Bookmark,
  Activity,
  BarChart,
  CheckCircle,
  Info,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import MemberInvite from '@/components/MemberInvite';
import ProjectNotes from '@/components/ProjectNotes';
import ProjectImageUpload from '@/components/ProjectImageUpload';
import ImageSummaryButton from '@/components/ImageSummaryButton';
import ProjectChat from '@/components/ProjectChat';
import { Progress } from '@/components/ui/progress';

interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  avatar?: string;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  owner_id: string;
}

interface UploadedImage {
  url: string;
  path: string;
  size: number;
  name: string;
  createdAt: Date;
  summary?: string;
}

const Project = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [projectImages, setProjectImages] = useState<UploadedImage[]>([]);
  const [recentImages, setRecentImages] = useState<UploadedImage[]>([]);
  const [isImagesLoading, setIsImagesLoading] = useState(false);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!id || !user) return;

      try {
        setLoading(true);

        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (projectError) throw projectError;
        
        const isOwner = projectData.owner_id === user.id;
        
        if (!isOwner) {
          const { data: memberData, error: memberError } = await supabase
            .from('project_members')
            .select('role')
            .eq('project_id', id)
            .eq('user_id', user.id)
            .single();

          if (memberError) {
            navigate('/dashboard');
            toast.error("You don't have access to this project");
            return;
          }
          
          setUserRole(memberData.role);
        } else {
          setUserRole('owner');
        }

        setProject(projectData);

        const { data: membersData, error: membersError } = await supabase
          .from('project_members')
          .select('id, role, user_id')
          .eq('project_id', id);

        if (membersError) throw membersError;

        const { data: ownerProfile, error: ownerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', projectData.owner_id)
          .single();

        if (ownerError) throw ownerError;

        const memberIds = membersData.map((member: any) => member.user_id);
        
        let memberProfiles = [];
        if (memberIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', memberIds);
            
          if (profilesError) throw profilesError;
          memberProfiles = profilesData || [];
        }

        const membersWithProfiles = membersData.map((member: any) => {
          const profile = memberProfiles.find((p: any) => p.id === member.user_id) || {};
          return {
            id: member.user_id,
            name: profile.full_name || 'Unknown User',
            email: '', // We don't expose emails
            role: member.role,
            avatar: profile.avatar_url
          };
        });

        const allMembers: ProjectMember[] = [
          {
            id: ownerProfile.id,
            name: ownerProfile.full_name || 'Unknown',
            email: '', // We don't expose emails
            role: 'owner',
            avatar: ownerProfile.avatar_url
          },
          ...membersWithProfiles
        ];

        setMembers(allMembers);
      } catch (error: any) {
        console.error("Error fetching project data:", error);
        toast.error("Failed to load project data");
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id, user, navigate]);

  useEffect(() => {
    const fetchProjectImages = async () => {
      if (!id || !user) return;

      try {
        setIsImagesLoading(true);
        
        const { data, error } = await supabase
          .storage
          .from('project_images')
          .list(`${id}`);

        if (error) throw error;

        if (data) {
          const imageUrls = await Promise.all(
            data.map(async (item) => {
              const { data: urlData } = await supabase
                .storage
                .from('project_images')
                .getPublicUrl(`${id}/${item.name}`);
              
              // Fetch summary if exists
              const { data: summaryData } = await supabase
                .from('image_summaries')
                .select('summary')
                .eq('image_url', urlData.publicUrl)
                .eq('user_id', user.id)
                .single();

              return {
                url: urlData.publicUrl,
                path: `${id}/${item.name}`,
                size: item.metadata?.size || 0,
                name: item.name,
                createdAt: new Date(item.created_at || Date.now()),
                summary: summaryData?.summary || undefined
              };
            })
          );

          const sortedImages = imageUrls.sort((a, b) => 
            b.createdAt.getTime() - a.createdAt.getTime()
          );

          setProjectImages(sortedImages);
          setRecentImages(sortedImages.slice(0, 3));
        }
      } catch (error: any) {
        console.error('Error fetching images:', error);
      } finally {
        setIsImagesLoading(false);
      }
    };

    fetchProjectImages();
  }, [id, user]);

  const handleDeleteProject = async () => {
    if (!project || !user || userRole !== 'owner') return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this project? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) throw error;

      toast.success("Project deleted successfully");
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  const handleAddMember = () => {
    setShowInviteDialog(true);
  };

  const handleInviteSuccess = async () => {
    if (!id || !user) return;
    
    try {
      const { data: membersData, error: membersError } = await supabase
        .from('project_members')
        .select('id, role, user_id')
        .eq('project_id', id);

      if (membersError) throw membersError;

      const { data: ownerProfile, error: ownerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', project?.owner_id)
        .single();

      if (ownerError) throw ownerError;

      const memberIds = membersData.map((member: any) => member.user_id);
      
      let memberProfiles = [];
      if (memberIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', memberIds);
          
        if (profilesError) throw profilesError;
        memberProfiles = profilesData || [];
      }

      const membersWithProfiles = membersData.map((member: any) => {
        const profile = memberProfiles.find((p: any) => p.id === member.user_id) || {};
        return {
          id: member.user_id,
          name: profile.full_name || 'Unknown User',
          email: '', // We don't expose emails
          role: member.role,
          avatar: profile.avatar_url
        };
      });

      const allMembers: ProjectMember[] = [
        {
          id: ownerProfile.id,
          name: ownerProfile.full_name || 'Unknown',
          email: '', // We don't expose emails
          role: 'owner',
          avatar: ownerProfile.avatar_url
        },
        ...membersWithProfiles
      ];

      setMembers(allMembers);
    } catch (error: any) {
      console.error("Error refreshing members:", error);
      toast.error("Failed to refresh member list");
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    if (!project || userRole !== 'owner') return;

    try {
      const { error } = await supabase
        .from('project_members')
        .update({ role: newRole })
        .eq('project_id', project.id)
        .eq('user_id', memberId);

      if (error) throw error;

      setMembers(members.map(member => 
        member.id === memberId ? { ...member, role: newRole as any } : member
      ));

      toast.success("Member role updated successfully");
    } catch (error: any) {
      console.error("Error updating member role:", error);
      toast.error("Failed to update member role");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!project || userRole !== 'owner') return;

    const confirmed = window.confirm(
      "Are you sure you want to remove this member from the project?"
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', project.id)
        .eq('user_id', memberId);

      if (error) throw error;

      setMembers(members.filter(member => member.id !== memberId));
      toast.success("Member removed successfully");
    } catch (error: any) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  };

  const handleImageUploadComplete = (imageUrl: string) => {
    // Refresh the project images
    const fetchUpdatedImages = async () => {
      if (!id || !user) return;

      try {
        const { data, error } = await supabase
          .storage
          .from('project_images')
          .list(`${id}`);

        if (error) throw error;

        if (data) {
          const imageUrls = await Promise.all(
            data.map(async (item) => {
              const { data: urlData } = await supabase
                .storage
                .from('project_images')
                .getPublicUrl(`${id}/${item.name}`);
              
              return {
                url: urlData.publicUrl,
                path: `${id}/${item.name}`,
                size: item.metadata?.size || 0,
                name: item.name,
                createdAt: new Date(item.created_at || Date.now())
              };
            })
          );

          const sortedImages = imageUrls.sort((a, b) => 
            b.createdAt.getTime() - a.createdAt.getTime()
          );

          setProjectImages(sortedImages);
          setRecentImages(sortedImages.slice(0, 3));
        }
      } catch (error: any) {
        console.error('Error fetching updated images:', error);
      }
    };

    fetchUpdatedImages();
    toast.success('Image uploaded successfully');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const daysSinceCreation = () => {
    if (!project) return 0;
    const creationDate = new Date(project.created_at);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - creationDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const activityPercentage = Math.floor(Math.random() * 60) + 40;

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
                <Badge variant="outline" className={`font-normal ${userRole === 'owner' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                  {userRole === 'owner' ? 'Owner' : 'Member'}
                </Badge>
                <Badge variant="outline" className="font-normal bg-purple-100 text-purple-800">
                  Active {daysSinceCreation()} days
                </Badge>
              </div>
              
              <h1 className="text-3xl font-bold">{project?.title}</h1>
              <p className="text-muted-foreground mt-1 max-w-3xl">
                {project?.description || "No description provided"}
              </p>
            </div>
            
            <div className="flex gap-2">
              {userRole === 'owner' && (
                <Button variant="outline" onClick={handleAddMember}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  {userRole === 'owner' && (
                    <>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit project
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        Project settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={handleDeleteProject}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete project
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-1" />
              <span>Created: {formatDate(project?.created_at || '')}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>Last updated: {formatDate(project?.updated_at || '')}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{members.length} member{members.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center">
              <Image className="h-4 w-4 mr-1" />
              <span>{projectImages.length} image{projectImages.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="notes">
              <StickyNote className="h-4 w-4 mr-2" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="images">
              <Image className="h-4 w-4 mr-2" />
              Images
            </TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            {userRole === 'owner' && (
              <TabsTrigger value="settings">Settings</TabsTrigger>
            )}
            <TabsTrigger value="chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              Project Chat
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
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
                      <div className="text-xl font-bold text-primary">{projectImages.length}</div>
                      <div className="text-xs text-muted-foreground">Images</div>
                    </div>
                    <div className="space-y-1 border rounded-md p-3">
                      <div className="text-xl font-bold text-primary">{members.length}</div>
                      <div className="text-xs text-muted-foreground">Members</div>
                    </div>
                    <div className="space-y-1 border rounded-md p-3">
                      <div className="text-xl font-bold text-primary">{daysSinceCreation()}</div>
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
                            onClick={handleAddMember}
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
                        <Button size="sm" variant="outline" onClick={() => setActiveTab('notes')}>
                          <StickyNote className="h-4 w-4 mr-2" />
                          View Notes
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setActiveTab('images')}>
                          <Image className="h-4 w-4 mr-2" />
                          Manage Images
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setActiveTab('chat')}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Project Chat
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Image className="h-5 w-5 mr-2 text-primary" />
                    Recent Images
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isImagesLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : recentImages.length === 0 ? (
                    <div className="text-center p-6 border border-dashed rounded-md">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">No images uploaded yet</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={() => setActiveTab('images')}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Images
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentImages.map((image) => (
                        <div key={image.path} className="flex gap-3 p-3 hover:bg-accent/50 rounded-md transition-colors">
                          <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
                            <img
                              src={image.url}
                              alt={image.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate" title={image.name}>
                              {image.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(image.size)} • {image.createdAt.toLocaleDateString()}
                            </p>
                            {image.summary && (
                              <div className="mt-1 flex items-center text-xs text-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                <span className="truncate">AI Summary available</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {projectImages.length > 3 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setActiveTab('images')}
                        >
                          View all {projectImages.length} images
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
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
                            onClick={() => setActiveTab('notes')}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Note
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setActiveTab('notes')}
                          >
                            View Notes
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
              
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
                    onClick={() => setActiveTab('images')}
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
                    onClick={() => setActiveTab('chat')}
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
                    onClick={() => setActiveTab('members')}
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
          </TabsContent>
          
          <TabsContent value="notes" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                {project && id && <ProjectNotes projectId={id} />}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Images</CardTitle>
                <CardDescription>
                  Upload and manage images for this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                {project && id && (
                  <ProjectImageUpload 
                    projectId={id} 
                    onUploadComplete={handleImageUploadComplete}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Project Members</CardTitle>
                  <CardDescription>
                    Manage project team and permissions
                  </CardDescription>
                </div>
                {userRole === 'owner' && (
                  <Button variant="outline" size="sm" onClick={handleAddMember}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.length === 0 ? (
                    <div className="text-center p-6 border border-dashed rounded-md">
                      <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">No members yet</p>
                      {userRole === 'owner' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4"
                          onClick={handleAddMember}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Members
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {members.map((member) => (
                        <div 
                          key={member.id} 
                          className="flex items-center justify-between p-3 rounded-md hover:bg-accent/40"
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              {member.avatar && <AvatarImage src={member.avatar} alt={member.name} />}
                              <AvatarFallback>
                                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.role}</p>
                            </div>
                          </div>
                          
                          {userRole === 'owner' && member.role !== 'owner' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleUpdateMemberRole(member.id, 'admin')}>
                                  Make admin
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateMemberRole(member.id, 'editor')}>
                                  Make editor
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateMemberRole(member.id, 'viewer')}>
                                  Make viewer
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleRemoveMember(member.id)}
                                >
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {showInviteDialog && (
                    <MemberInvite 
                      projectId={project.id} 
                      onClose={() => setShowInviteDialog(false)}
                      onInviteSuccess={handleInviteSuccess}
                      isOpen={showInviteDialog}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
                <CardDescription>
                  Configure project preferences and options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">Project settings are coming soon</p>
                  <p className="text-sm text-muted-foreground">Check back later for options to customize your project</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="chat" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Chat</CardTitle>
                <CardDescription>
                  Chat with AI about this project
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {project && id && <ProjectChat projectId={id} />}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Project;
