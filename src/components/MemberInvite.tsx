import React, { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

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
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findUserByEmail = async (email: string) => {
    console.log('Looking up user by email:', email);
    
    try {
      // Do a direct lookup in profiles table with case-insensitive search
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .ilike('email', email)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // No match found with ilike search
          console.log('No user found with case-insensitive search');
        } else {
          console.error('Error querying profiles:', profileError);
          throw profileError;
        }
      }
      
      if (profileData?.id) {
        console.log('User found:', profileData);
        return profileData.id;
      }

      // As a fallback, do an exact match search
      const { data: exactMatch } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
        
      if (exactMatch?.id) {
        console.log('User found with exact match:', exactMatch);
        return exactMatch.id;
      }
      
      throw new Error('User with this email not found. Please ensure they have created an account first.');
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Find the user by email
      const userId = await findUserByEmail(email);
      
      // If we still couldn't find the user, they don't exist in our system
      if (!userId) {
        throw new Error('User with this email not found. Please ensure they have created an account first.');
      }
      
      // Check if the user is already a member of this project
      const { data: existingMember, error: memberError } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .maybeSingle();
        
      if (memberError) throw memberError;
      
      if (existingMember) {
        throw new Error('User is already a member of this project');
      }
      
      // Add the user as a project member
      const { error: insertError } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: userId,
          role: role
        });
        
      if (insertError) throw insertError;
      
      toast.success(`User invited successfully with ${role} role`);
      onInviteSuccess();
      onClose();
      
    } catch (error: any) {
      console.error('Error inviting member:', error);
      setError(error.message || 'Failed to invite member');
      toast.error(error.message || 'Failed to invite member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Invite a team member to collaborate on this project.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Invite Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MemberInvite;
