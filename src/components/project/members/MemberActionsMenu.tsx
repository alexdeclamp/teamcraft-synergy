
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from 'lucide-react';

interface MemberActionsMenuProps {
  memberId: string;
  onUpdateRole: (memberId: string, newRole: string) => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
}

const MemberActionsMenu: React.FC<MemberActionsMenuProps> = ({
  memberId,
  onUpdateRole,
  onRemoveMember
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onUpdateRole(memberId, 'admin')}>
          Make admin
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onUpdateRole(memberId, 'editor')}>
          Make editor
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onUpdateRole(memberId, 'viewer')}>
          Make viewer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-red-600"
          onClick={() => onRemoveMember(memberId)}
        >
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MemberActionsMenu;
