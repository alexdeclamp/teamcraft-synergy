
import React from 'react';
import MembersList from './members/MembersList';
import EmptyMembersList from './members/EmptyMembersList';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUserFeatures } from '@/hooks/useUserFeatures';
import { useProjectMembers } from '@/hooks/useProjectMembers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MemberInvite from '@/components/MemberInvite';

interface ProjectMembersProps {
  projectId: string;
  userRole: string | null;
}

const ProjectMembers: React.FC<ProjectMembersProps> = ({ projectId, userRole }) => {
  const { userFeatures } = useUserFeatures();
  const { 
    members,
    loading, 
    showInviteDialog,
    setShowInviteDialog,
    handleAddMember 
  } = useProjectMembers(projectId, null, userRole === 'owner' ? projectId : undefined);

  const handleInviteSuccess = () => {
    // Refresh happens automatically via useProjectMembers
    toast.success('Member invited successfully');
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('project_members')
        .update({ role: newRole })
        .eq('project_id', projectId)
        .eq('user_id', memberId);
        
      if (error) throw error;
      
      // Update local state by refreshing from the hook
      toast.success(`Member role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating member role:', error);
      toast.error('Failed to update member role');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', memberId);
        
      if (error) throw error;
      
      // Update will happen on next fetch via the hook
      toast.success('Member removed from project');
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">Loading members...</p>
      </div>
    );
  }

  if (!userFeatures.canShareBrains) {
    return (
      <Alert className="my-4">
        <AlertTitle>Sharing not available</AlertTitle>
        <AlertDescription>
          Brain sharing is only available on the Pro plan. Upgrade your subscription to invite team members to collaborate on this brain.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {showInviteDialog && (
        <MemberInvite 
          projectId={projectId} 
          isOpen={showInviteDialog}
          onClose={() => setShowInviteDialog(false)}
          onInviteSuccess={handleInviteSuccess}
        />
      )}
      
      {members && members.length > 0 ? (
        <MembersList 
          members={members} 
          userRole={userRole} 
          onUpdateMemberRole={handleUpdateMemberRole}
          onRemoveMember={handleRemoveMember}
          onAddMember={handleAddMember}
        />
      ) : (
        <EmptyMembersList 
          userRole={userRole}
          onAddMember={handleAddMember}
        />
      )}
    </div>
  );
};

export default ProjectMembers;
