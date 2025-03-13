
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import PrivateBetaNotice from './PrivateBetaNotice';

const INVITATION_CODE = "I NEED BRA3N";

const RegisterForm = () => {
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerFullName, setRegisterFullName] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [invitationError, setInvitationError] = useState<string | null>(null);

  // Reset invitation error when code changes
  useEffect(() => {
    if (invitationError && invitationCode) {
      setInvitationError(null);
    }
  }, [invitationCode]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerEmail || !registerPassword || !registerFullName) return;
    
    // Validate invitation code
    if (invitationCode !== INVITATION_CODE) {
      setInvitationError('Invalid invitation code');
      return;
    }
    
    setLoading(true);
    await signUp(registerEmail, registerPassword, registerFullName);
    setLoading(false);
  };

  return (
    <>
      <PrivateBetaNotice />
      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="full-name" className="text-sm font-medium">
            Full Name
          </label>
          <Input
            id="full-name"
            type="text"
            placeholder="John Doe"
            value={registerFullName}
            onChange={(e) => setRegisterFullName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="register-email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="register-email"
            type="email"
            placeholder="your@email.com"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="register-password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="register-password"
            type="password"
            placeholder="••••••••"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Password must be at least 6 characters long
          </p>
        </div>
        <div className="space-y-2">
          <label htmlFor="invitation-code" className="text-sm font-medium flex items-center gap-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Invitation Code</span>
          </label>
          <Input
            id="invitation-code"
            type="text"
            placeholder="Enter your invitation code"
            value={invitationCode}
            onChange={(e) => setInvitationCode(e.target.value)}
            required
            className={invitationError ? "border-red-500" : ""}
          />
          {invitationError && (
            <p className="text-xs text-red-500">{invitationError}</p>
          )}
          <div className="text-xs text-muted-foreground">
            Don't have an invitation code?{" "}
            <Link to="/waitlist" className="text-primary hover:underline">
              Join our waitlist
            </Link>
            {" "}to request access.
          </div>
        </div>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading || !registerEmail || !registerPassword || !registerFullName || !invitationCode}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Join Private Beta
        </Button>
      </form>
    </>
  );
};

export default RegisterForm;
