
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Lock, Users } from 'lucide-react';

const CtaSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
      <h2 className="text-3xl font-bold tracking-tight mb-6">Ready to Transform Your Knowledge Management?</h2>
      <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-4">
        Join thousands of professionals who use Bra3n to organize their thoughts, research, and projects.
      </p>
      <p className="text-primary text-sm flex items-center justify-center gap-1 mb-10">
        <Lock className="h-4 w-4" />
        <span>Currently invite-only. Join our waitlist for early access.</span>
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          size="lg" 
          onClick={() => navigate('/waitlist')} 
          className="rounded-full px-8 gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Join Waitlist
        </Button>
        <Button 
          variant="cta"
          size="lg"
          onClick={() => navigate('/auth?tab=register')}
          className="rounded-full px-8 gap-2"
        >
          <Users className="h-4 w-4" />
          Collaborate on a Pro Trial
        </Button>
      </div>
    </section>
  );
};

export default CtaSection;
