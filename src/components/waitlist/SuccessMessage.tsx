
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const SuccessMessage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="py-6 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-4">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
      </div>
      <h3 className="text-lg font-medium">Thanks for joining our waitlist!</h3>
      <p className="mt-2 text-muted-foreground">
        We've received your request and will notify you when you're granted access.
      </p>
      <Button
        className="mt-6"
        onClick={() => navigate('/')}
      >
        Return to Home
      </Button>
    </div>
  );
};
