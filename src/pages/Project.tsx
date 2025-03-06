
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Loader2, FileWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Import our refactored components
import ProjectHeader from '@/components/project/ProjectHeader';
import ProjectMembers from '@/components/project/ProjectMembers';
import ProjectImages from '@/components/project/ProjectImages';
import ProjectSettings from '@/components/project/ProjectSettings';
import ProjectChatTab from '@/components/project/ProjectChatTab';
import ProjectNotesTab from '@/components/project/ProjectNotes';
import ProjectOverview from '@/components/project/ProjectOverview';
import ProjectQuickLinks from '@/components/project/ProjectQuickLinks';
import RecentImagesCard from '@/components/project/RecentImagesCard';

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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleImagesUpdated = (images: UploadedImage[], recent: UploadedImage[]) => {
    setProjectImages(images);
    setRecentImages(recent);
  };

  const handleAddMember = () => {
    setShowInviteDialog(true);
  };

  const daysSinceCreation = () => {
    if (!project) return 0;
    const creationDate = new Date(project.created_at);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - creationDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Generate a random activity percentage (would be replaced with real data in production)
  const activityPercentage = Math.floor(Math.random() * 60) + 40;

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
          <Loader2 className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12 animate-fade-in">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        {/* Project Header */}
        <ProjectHeader
          project={project}
          userRole={userRole}
          membersCount={members.length}
          imagesCount={projectImages.length}
          daysSinceCreation={daysSinceCreation()}
          onAddMember={handleAddMember}
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="notes">
              <div className="flex items-center">
                <span className="h-4 w-4 mr-2">📝</span>
                Notes
              </div>
            </TabsTrigger>
            <TabsTrigger value="images">
              <div className="flex items-center">
                <span className="h-4 w-4 mr-2">🖼️</span>
                Images
              </div>
            </TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            {userRole === 'owner' && (
              <TabsTrigger value="settings">Settings</TabsTrigger>
            )}
            <TabsTrigger value="chat">
              <div className="flex items-center">
                <span className="h-4 w-4 mr-2">💬</span>
                Project Chat
              </div>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Project Overview */}
            <ProjectOverview 
              project={project}
              members={members}
              userRole={userRole}
              activityPercentage={activityPercentage}
              daysSinceCreation={daysSinceCreation()}
              imageCount={projectImages.length}
              onAddMember={handleAddMember}
              onTabChange={setActiveTab}
            />

            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Images */}
              <RecentImagesCard
                recentImages={recentImages}
                totalImagesCount={projectImages.length}
                isImagesLoading={isImagesLoading}
                formatFileSize={formatFileSize}
                onViewAllImages={() => setActiveTab('images')}
              />
              
              {/* Project Notes Card */}
              <div className="space-y-3">
                <div className="p-6 border border-dashed rounded-md">
                  <div className="text-center">
                    <span className="text-3xl mb-2 block">📝</span>
                    <p className="text-muted-foreground mb-2">Capture ideas and keep track of important information</p>
                    <div className="flex justify-center gap-2">
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => setActiveTab('notes')}
                      >
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
            </div>
              
            {/* Quick Links */}
            <ProjectQuickLinks onTabChange={setActiveTab} />
          </TabsContent>
          
          <TabsContent value="notes" className="space-y-6">
            {/* Project Notes */}
            {project && id && <ProjectNotesTab projectId={id} />}
          </TabsContent>
          
          <TabsContent value="images" className="space-y-6">
            {/* Project Images */}
            {project && id && (
              <ProjectImages 
                projectId={id} 
                onImagesUpdated={handleImagesUpdated}
              />
            )}
          </TabsContent>
          
          <TabsContent value="members" className="space-y-6">
            {/* Project Members */}
            {project && (
              <ProjectMembers
                projectId={project.id}
                members={members}
                setMembers={setMembers}
                userRole={userRole}
              />
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            {/* Project Settings */}
            {project && id && <ProjectSettings projectId={id} />}
          </TabsContent>
          
          <TabsContent value="chat" className="space-y-6">
            {/* Project Chat */}
            {project && id && <ProjectChatTab projectId={id} />}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Project;
