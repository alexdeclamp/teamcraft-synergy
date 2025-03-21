
import React, { useState } from 'react';
import MembersList from './members/MembersList';
import EmptyMembersList from './members/EmptyMembersList';
import MemberInvite from '@/components/MemberInvite';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUserFeatures } from '@/hooks/useUserFeatures';
import { ProjectMember } from '@/types/project';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProjectMembersProps {
  projectId: string;
  userRole: string | null;
}

const ProjectMembers: React.FC<ProjectMembersProps> = ({ projectId, userRole }) => {
  const { userFeatures } = useUserFeatures();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  // Fetch members on component mount
  React.useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('project_members')
          .select('*')
          .eq('project_id', projectId);
          
        if (error) throw error;
        
        // Transform data to ProjectMember format
        const formattedMembers = data?.map(member => ({
          id: member.user_id,
          name: member.user_name || 'Anonymous User',
          email: '',
          role: member.role,
          avatar: member.avatar_url
        })) || [];
        
        setMembers(formattedMembers);
      } catch (error) {
        console.error('Error fetching project members:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMembers();
  }, [projectId]);

  const handleAddMember = () => {
    setShowInviteDialog(true);
  };

  const handleInviteSuccess = () => {
    // Refresh members list
    const fetchMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('project_members')
          .select('*')
          .eq('project_id', projectId);
          
        if (error) throw error;
        
        // Transform data to ProjectMember format
        const formattedMembers = data?.map(member => ({
          id: member.user_id,
          name: member.user_name || 'Anonymous User',
          email: '',
          role: member.role,
          avatar: member.avatar_url
        })) || [];
        
        setMembers(formattedMembers);
      } catch (error) {
        console.error('Error refreshing project members:', error);
      }
    };
    
    fetchMembers();
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('project_members')
        .update({ role: newRole })
        .eq('project_id', projectId)
        .eq('user_id', memberId);
        
      if (error) throw error;
      
      // Update local state
      setMembers(prevMembers => 
        prevMembers.map(member => 
          member.id === memberId ? { ...member, role: newRole as any } : member
        )
      );
      
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
      
      // Update local state
      setMembers(prevMembers => 
        prevMembers.filter(member => member.id !== memberId)
      );
      
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
      {userRole === 'owner' && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Invite New Members</h3>
          <MemberInvite 
            projectId={projectId} 
            isOpen={showInviteDialog}
            onClose={() => setShowInviteDialog(false)}
            onInviteSuccess={handleInviteSuccess}
          />
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium mb-4">Project Members</h3>
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
    </div>
  );
};

export default ProjectMembers;
