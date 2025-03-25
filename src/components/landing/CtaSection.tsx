
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';

const CtaSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
      <h2 className="text-3xl font-bold tracking-tight mb-6">Ready to Transform Your Knowledge Management?</h2>
      <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
        Join thousands of professionals who use Bra3n to organize their thoughts, research, and projects.
      </p>
      <Button 
        size="lg" 
        onClick={() => navigate('/auth?tab=register')} 
        className="rounded-full px-8 gap-2"
      >
        <Brain className="h-4 w-4" />
        Get Started Now
      </Button>
    </section>
  );
};

export default CtaSection;
