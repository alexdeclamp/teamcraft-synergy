
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProjectMember, Project } from '@/types/project';
import { toast } from 'sonner';

interface UseProjectMembersResult {
  members: ProjectMember[];
  userRole: string | null;
  loading: boolean;
  handleAddMember: () => void;
  showInviteDialog: boolean;
  setShowInviteDialog: (show: boolean) => void;
}

export const useProjectMembers = (
  projectId: string | undefined,
  project?: Project | null,
  userId?: string | undefined
): UseProjectMembersResult => {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get current user information
        const { data: { user } } = await supabase.auth.getUser();
        const currentUserId = user?.id;
        
        if (!currentUserId) {
          console.error("No authenticated user found");
          setLoading(false);
          return;
        }
        
        // Check if current user is owner
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('owner_id')
          .eq('id', projectId)
          .single();
        
        if (projectError) {
          console.error("Error fetching project:", projectError);
          setLoading(false);
          return;
        }
        
        const isOwner = projectData.owner_id === currentUserId;
        
        if (isOwner) {
          setUserRole('owner');
        } else {
          const { data: memberData, error: memberError } = await supabase
            .from('project_members')
            .select('role')
            .eq('project_id', projectId)
            .eq('user_id', currentUserId)
            .single();

          if (!memberError) {
            setUserRole(memberData.role);
          } else {
            console.error("Error checking member role:", memberError);
          }
        }

        // Fetch all members
        const { data: membersData, error: membersError } = await supabase
          .from('project_members')
          .select('id, role, user_id')
          .eq('project_id', projectId);

        if (membersError) {
          console.error("Error fetching members data:", membersError);
          setLoading(false);
          return;
        }

        // Fetch project owner info
        const { data: ownerProfile, error: ownerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', projectData.owner_id)
          .single();

        if (ownerError) {
          console.error("Error fetching owner profile:", ownerError);
          setLoading(false);
          return;
        }

        // Fetch profiles for all members
        const memberIds = membersData.map((member: any) => member.user_id);
        
        let memberProfiles = [];
        if (memberIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', memberIds);
            
          if (profilesError) {
            console.error("Error fetching member profiles:", profilesError);
          } else {
            memberProfiles = profilesData || [];
          }
        }

        // Combine data
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
            name: ownerProfile.full_name || 'Project Owner',
            email: '', // We don't expose emails
            role: 'owner',
            avatar: ownerProfile.avatar_url
          },
          ...membersWithProfiles
        ];

        setMembers(allMembers);
      } catch (error: any) {
        console.error("Error in useProjectMembers hook:", error);
        toast.error("Failed to load project members");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [projectId]);

  const handleAddMember = () => {
    setShowInviteDialog(true);
  };

  return {
    members,
    userRole,
    loading,
    handleAddMember,
    showInviteDialog,
    setShowInviteDialog
  };
};
