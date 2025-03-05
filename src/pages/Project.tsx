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
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import MemberInvite from '@/components/MemberInvite';
import ProjectNotes from '@/components/ProjectNotes';

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
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="notes">
              <StickyNote className="h-4 w-4 mr-2" />
              Notes
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
          
          <TabsContent value="notes" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                {project && id && <ProjectNotes projectId={id} />}
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
