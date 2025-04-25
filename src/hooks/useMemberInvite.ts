
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { findUserByEmail } from '@/utils/memberUtils';

interface UseMemberInviteProps {
  projectId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const useMemberInvite = ({ projectId, onSuccess, onClose }: UseMemberInviteProps) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate email function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Sanitize role input
  const sanitizeRole = (role: string): string => {
    const validRoles = ['viewer', 'editor', 'admin'];
    return validRoles.includes(role) ? role : 'viewer';
  };

  const inviteMember = useCallback(async () => {
    // Validate email
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Sanitize role
    const safeRole = sanitizeRole(role);
    
    setLoading(true);
    setError(null);
    
    try {
      // Find the user by email
      const userId = await findUserByEmail(email.trim().toLowerCase());
      
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
          role: safeRole
        });
        
      if (insertError) throw insertError;
      
      toast.success(`User invited successfully with ${safeRole} role`);
      onSuccess();
      onClose();
      
    } catch (error: any) {
      console.error('Error inviting member:', error);
      setError(error.message || 'Failed to invite member');
      toast.error(error.message || 'Failed to invite member');
    } finally {
      setLoading(false);
    }
  }, [email, role, projectId, onSuccess, onClose]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await inviteMember();
  }, [inviteMember]);

  return {
    email,
    setEmail,
    role,
    setRole,
    loading,
    error,
    handleSubmit,
  };
};
