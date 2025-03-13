import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import HomepageChatButton from '@/components/landing/HomepageChatButton';
import HomepageChatDialog from '@/components/landing/HomepageChatDialog';

const Index = () => {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showChatButton, setShowChatButton] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div className="flex items-center justify-center mb-6">
          <Sparkles className="h-12 w-12 sm:h-14 sm:w-14 text-primary" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-3 sm:mb-4">
          Bra<span className="text-primary">3</span>n
        </h1>
        <p className="text-muted-foreground text-lg sm:text-xl max-w-xl mx-auto leading-relaxed mb-8 sm:mb-10">
          Intelligent analysis for your projects. Seamlessly organize documents, generate insights, and collaborate with your team.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate('/auth?tab=register')} size="lg" className="rounded-md px-8 text-base shadow-sm w-full sm:w-auto">
            Try Bra3n
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
          <Button 
            onClick={() => window.open('https://docs.example.com', '_blank')} 
            variant="outline" 
            size="lg"
            className="rounded-md px-8 text-base w-full sm:w-auto"
          >
            Learn More
          </Button>
        </div>
      </div>
      
      <HomepageChatButton 
        onClick={() => setIsChatOpen(true)} 
        className="shadow-2xl" 
      />
      
      <HomepageChatDialog 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
};

export default Index;
