
import React from 'react';
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyMembersListProps {
  userRole: string | null;
  onAddMember: () => void;
}

const EmptyMembersList: React.FC<EmptyMembersListProps> = ({
  userRole,
  onAddMember
}) => {
  return (
    <div className="text-center p-6 border border-dashed rounded-md">
      <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
      <p className="text-muted-foreground">No members yet</p>
      {userRole === 'owner' && (
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4"
          onClick={onAddMember}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Members
        </Button>
      )}
    </div>
  );
};

export default EmptyMembersList;
