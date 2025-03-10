
import React from 'react';
import MemberItem from './MemberItem';
import EmptyMembersList from './EmptyMembersList';
import { ProjectMember } from '@/types/project';

interface MembersListProps {
  members: ProjectMember[];
  userRole: string | null;
  onUpdateMemberRole: (memberId: string, newRole: string) => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
  onAddMember: () => void;
}

const MembersList: React.FC<MembersListProps> = ({
  members,
  userRole,
  onUpdateMemberRole,
  onRemoveMember,
  onAddMember
}) => {
  if (members.length === 0) {
    return <EmptyMembersList userRole={userRole} onAddMember={onAddMember} />;
  }

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <MemberItem 
          key={member.id} 
          member={member}
          userRole={userRole}
          onUpdateRole={onUpdateMemberRole}
          onRemoveMember={onRemoveMember}
        />
      ))}
    </div>
  );
};

export default MembersList;
