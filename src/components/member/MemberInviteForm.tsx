
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

interface MemberInviteFormProps {
  email: string;
  setEmail: (email: string) => void;
  role: string;
  setRole: (role: string) => void;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
}

const MemberInviteForm: React.FC<MemberInviteFormProps> = ({
  email,
  setEmail,
  role,
  setRole,
  loading,
  error,
  onSubmit,
  onCancel
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          placeholder="colleague@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={role}
          onValueChange={setRole}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Admins can manage members, Editors can edit content, Viewers can only view
        </p>
      </div>
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      
      <div className="flex flex-row-reverse sm:justify-end sm:space-x-2 space-y-2 sm:space-y-0 pt-2">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Invite Member
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={loading}
          className="sm:mr-2"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default MemberInviteForm;
