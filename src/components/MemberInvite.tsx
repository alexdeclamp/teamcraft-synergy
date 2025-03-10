
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import MemberInviteForm from '@/components/member/MemberInviteForm';
import { useMemberInvite } from '@/hooks/useMemberInvite';

interface MemberInviteProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onInviteSuccess: () => void;
}

const MemberInvite: React.FC<MemberInviteProps> = ({ 
  projectId, 
  isOpen, 
  onClose,
  onInviteSuccess
}) => {
  const {
    email,
    setEmail,
    role,
    setRole,
    loading,
    error,
    handleSubmit,
  } = useMemberInvite({
    projectId,
    onSuccess: onInviteSuccess,
    onClose
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Invite a team member to collaborate on this project.
          </DialogDescription>
        </DialogHeader>
        
        <MemberInviteForm
          email={email}
          setEmail={setEmail}
          role={role}
          setRole={setRole}
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default MemberInvite;
