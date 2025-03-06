
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
  project: Project | null,
  userId: string | undefined
): UseProjectMembersResult => {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!projectId || !project || !userId) return;

      try {
        setLoading(true);
        
        const isOwner = project.owner_id === userId;
        
        if (!isOwner) {
          const { data: memberData, error: memberError } = await supabase
            .from('project_members')
            .select('role')
            .eq('project_id', projectId)
            .eq('user_id', userId)
            .single();

          if (memberError) {
            throw memberError;
          }
          
          setUserRole(memberData.role);
        } else {
          setUserRole('owner');
        }

        const { data: membersData, error: membersError } = await supabase
          .from('project_members')
          .select('id, role, user_id')
          .eq('project_id', projectId);

        if (membersError) throw membersError;

        const { data: ownerProfile, error: ownerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', project.owner_id)
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
        console.error("Error fetching project members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [projectId, project, userId]);

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
