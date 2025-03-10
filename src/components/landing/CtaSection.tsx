
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, ArrowRight } from 'lucide-react';

const CtaSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
      <Card className="apple-glass p-8 md:p-12 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent -z-10" />
        <CardContent className="space-y-6 p-0">
          <Sparkles className="h-12 w-12 text-primary mx-auto" />
          <h2 className="text-3xl sm:text-4xl font-semibold">🚀 Ready to Try?</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            💡 Start organizing your knowledge with AI today.
          </p>
          <div className="flex flex-col items-center gap-4 pt-4">
            <Button onClick={() => navigate('/auth')} size="lg" className="rounded-full px-8 text-base shadow-sm w-full sm:w-auto">
              Try for Free
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <p className="text-sm text-muted-foreground">No credit card required.</p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default CtaSection;
