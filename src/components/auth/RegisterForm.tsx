
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const RegisterForm = () => {
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerFullName, setRegisterFullName] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerEmail || !registerPassword || !registerFullName) return;
    
    setLoading(true);
    await signUp(registerEmail, registerPassword, registerFullName);
    setLoading(false);
  };

  return (
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
      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading || !registerEmail || !registerPassword || !registerFullName}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>
    </form>
  );
};

export default RegisterForm;
