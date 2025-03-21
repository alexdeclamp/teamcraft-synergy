
import React from 'react';
import MembersList from './members/MembersList';
import EmptyMembersList from './members/EmptyMembersList';
import MemberInvite from '@/components/MemberInvite';
import { useProjectMembers } from '@/hooks/useProjectMembers';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUserFeatures } from '@/hooks/useUserFeatures';

interface ProjectMembersProps {
  projectId: string;
  userRole: string | null;
}

const ProjectMembers: React.FC<ProjectMembersProps> = ({ projectId, userRole }) => {
  const { members, isLoading } = useProjectMembers(projectId);
  const { userFeatures } = useUserFeatures();

  if (isLoading) {
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
          <MemberInvite projectId={projectId} />
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium mb-4">Project Members</h3>
        {members && members.length > 0 ? (
          <MembersList members={members} projectId={projectId} userRole={userRole} />
        ) : (
          <EmptyMembersList />
        )}
      </div>
    </div>
  );
};

export default ProjectMembers;
