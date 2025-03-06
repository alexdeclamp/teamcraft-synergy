
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
  Users,
  Loader2,
  StickyNote,
  Image,
  ImageIcon,
  FileWarning,
  MessageSquare,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import MemberInvite from '@/components/MemberInvite';
import ProjectNotes from '@/components/ProjectNotes';
import ProjectImageUpload from '@/components/ProjectImageUpload';
import ImageSummaryButton from '@/components/ImageSummaryButton';

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
                <Badge variant="outline" className="font-normal bg-green-100 text-green-800">
                  {userRole === 'owner' ? 'Owner' : 'Member'}
                </Badge>
              </div>
              
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <p className="text-muted-foreground mt-1 max-w-3xl">
                {project.description}
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
              <span>Created: {formatDate(project.created_at)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>Last updated: {formatDate(project.updated_at)}</span>
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
                  {project.description || "This project contains visual assets and collaborative resources."}
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center">
                      <Image className="h-5 w-5 mr-2 text-muted-foreground" />
                      Recent Images
                    </h3>
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
                          <div key={image.path} className="flex gap-3 p-3 bg-accent/50 rounded-md">
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
                                  <MessageSquare className="h-3 w-3 mr-1" />
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
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center">
                      <StickyNote className="h-5 w-5 mr-2 text-muted-foreground" />
                      Project Notes
                    </h3>
                    <div className="space-y-3">
                      <div className="p-6 border border-dashed rounded-md">
                        <div className="text-center">
                          <StickyNote className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-muted-foreground mb-4">Capture ideas and keep track of important information</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setActiveTab('notes')}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            View Notes
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                    Project Members
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
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
                    People with access to this project
                  </CardDescription>
                </div>
                {userRole === 'owner' && (
                  <Button size="sm" onClick={handleAddMember}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                )}
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
                          <Badge variant="outline" className="mt-1">
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      
                      {userRole === 'owner' && member.role !== 'owner' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Member options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[180px]">
                            <DropdownMenuLabel>Member Actions</DropdownMenuLabel>
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
                              Remove from project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {userRole === 'owner' && (
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
          )}
        </Tabs>
      </main>

      {showInviteDialog && id && (
        <MemberInvite 
          projectId={id} 
          isOpen={showInviteDialog} 
          onClose={() => setShowInviteDialog(false)}
          onInviteSuccess={handleInviteSuccess}
        />
      )}
    </div>
  );
};

export default Project;
