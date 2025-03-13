
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, MessageSquare, Users } from 'lucide-react';
import { InvitationBanner } from '@/components/ui/invitation-banner';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <InvitationBanner />
      <div className="flex items-center justify-center pt-20 flex-1">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-4">
            Let's build something new.
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed mb-10">
            To deploy a new Project, import an existing Git Repository or get started with one of our Templates.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/waitlist')} 
              size="lg" 
              className="rounded-md px-8 text-base shadow-sm w-full sm:w-auto bg-primary hover:bg-primary/90"
            >
              Join Waitlist
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            
            <Button 
              onClick={() => navigate('/auth?tab=register')}
              variant="cta"
              size="lg"
              className="rounded-md px-8 text-base w-full sm:w-auto"
            >
              <Users className="mr-2 h-4 w-4" />
              Collaborate on a Pro Trial
            </Button>
            
            <Button 
              onClick={() => window.open('https://docs.example.com', '_blank')} 
              variant="ghost" 
              size="lg"
              className="rounded-md px-8 text-base w-full sm:w-auto"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat with AI
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Index;
