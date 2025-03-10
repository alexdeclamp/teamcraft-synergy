
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import MemberInvite from '@/components/MemberInvite';
import MembersList from './members/MembersList';
import { ProjectMember } from '@/types/project';

interface ProjectMembersProps {
  projectId: string;
  members: ProjectMember[];
  setMembers: React.Dispatch<React.SetStateAction<ProjectMember[]>>;
  userRole: string | null;
}

const ProjectMembers: React.FC<ProjectMembersProps> = ({
  projectId,
  members,
  setMembers,
  userRole
}) => {
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const handleAddMember = () => {
    setShowInviteDialog(true);
  };

  const handleInviteSuccess = async () => {
    try {
      const { data: membersData, error: membersError } = await supabase
        .from('project_members')
        .select('id, role, user_id')
        .eq('project_id', projectId);

      if (membersError) throw membersError;

      const { data: ownerProfile, error: ownerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', members.find(m => m.role === 'owner')?.id)
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
    if (userRole !== 'owner') return;

    try {
      const { error } = await supabase
        .from('project_members')
        .update({ role: newRole })
        .eq('project_id', projectId)
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
    if (userRole !== 'owner') return;

    const confirmed = window.confirm(
      "Are you sure you want to remove this member from the project?"
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', memberId);

      if (error) throw error;

      setMembers(members.filter(member => member.id !== memberId));
      toast.success("Member removed successfully");
    } catch (error: any) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  };

  return (
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
          <MembersList 
            members={members}
            userRole={userRole}
            onUpdateMemberRole={handleUpdateMemberRole}
            onRemoveMember={handleRemoveMember}
            onAddMember={handleAddMember}
          />
          
          {showInviteDialog && (
            <MemberInvite 
              projectId={projectId} 
              onClose={() => setShowInviteDialog(false)}
              onInviteSuccess={handleInviteSuccess}
              isOpen={showInviteDialog}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectMembers;
