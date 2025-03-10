
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CtaSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
      <div className="space-y-8">
        <h2 className="text-3xl sm:text-4xl font-medium">Ready to Try?</h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Start organizing your knowledge with AI today.
        </p>
        <div className="flex flex-col items-center gap-4 pt-4">
          <Button 
            onClick={() => navigate('/auth')} 
            className="bg-black text-white hover:bg-black/90 rounded-full px-8 py-6 h-auto text-base font-medium"
          >
            Try Bra3n
          </Button>
          <p className="text-sm text-muted-foreground">No credit card required.</p>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
