
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  avatar?: string;
}

interface UseProjectMembersResult {
  members: ProjectMember[];
  showInviteDialog: boolean;
  setShowInviteDialog: (show: boolean) => void;
  handleAddMember: () => void;
}

export const useProjectMembers = (
  projectId: string | undefined,
  project: any | null
): UseProjectMembersResult => {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  useEffect(() => {
    const fetchProjectMembers = async () => {
      if (!projectId || !project) return;

      try {
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
        toast.error("Failed to load project members");
      }
    };

    fetchProjectMembers();
  }, [projectId, project]);

  const handleAddMember = () => {
    setShowInviteDialog(true);
  };

  return {
    members,
    showInviteDialog,
    setShowInviteDialog,
    handleAddMember
  };
};
