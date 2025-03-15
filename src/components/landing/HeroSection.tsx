
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Brain, MessageSquare, FileText, FileImage, File, ArrowDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  return (
    <section className="relative pt-20 md:pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
      
      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left column - Hero Text */}
        <div className="flex flex-col">
          <div className="inline-flex items-center justify-center lg:justify-start px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 self-start">
            <Sparkles className="h-4 w-4 mr-2" />
            AI-Powered Knowledge Hub
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-4">
            Bra<span className="text-primary">3</span>n
          </h1>
          <p className="text-2xl sm:text-3xl font-medium text-foreground mb-4">Your AI Project Assistant.</p>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mb-8">
            Turn any documents into actionable insights instantly with AI-powered summaries and search.
          </p>
          <Button 
            onClick={() => navigate('/auth?tab=register')} 
            size="lg" 
            className="rounded-full px-8 text-base shadow-sm self-start"
          >
            Try Bra3n
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        
        {/* Right column - File Transformation Visual */}
        <div className="relative bg-background/50 border border-border/30 rounded-xl shadow-lg p-6 h-[400px] backdrop-blur-sm">
          <div className="relative h-full">
            {/* Input Files */}
            <div className="absolute left-0 top-0 animate-fade-in">
              <div className="space-y-3">
                <FileThumbnail icon={<FileText className="h-6 w-6 text-blue-500" />} label="Project Notes" color="bg-blue-100" />
                <FileThumbnail icon={<FileImage className="h-6 w-6 text-green-500" />} label="Images" color="bg-green-100" />
                <FileThumbnail icon={<File className="h-6 w-6 text-amber-500" />} label="Documents" color="bg-amber-100" />
              </div>
            </div>
            
            {/* Arrows pointing to Brain */}
            <div className="absolute left-[30%] top-[50%] transform -translate-y-1/2">
              <ArrowRight className="h-8 w-8 text-primary/70 animate-pulse" />
            </div>
            
            {/* Brain Processing Center */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="rounded-full bg-primary/20 p-6">
                <Brain className="h-12 w-12 text-primary animate-pulse" />
              </div>
              <span className="text-sm font-medium mt-2">AI Processing</span>
            </div>
            
            {/* Arrow pointing from Brain to Output */}
            <div className="absolute right-[30%] top-[50%] transform -translate-y-1/2">
              <ArrowRight className="h-8 w-8 text-primary/70 animate-pulse" />
            </div>
            
            {/* Output - Transformed Content */}
            <div className="absolute right-0 top-0 animate-fade-in">
              <div className="space-y-4">
                {/* AI Summary Card */}
                <div className="bg-white rounded-lg shadow p-3 w-64 border border-border/30">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                      <Brain className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">AI Summary</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Here are the key findings from your documents...
                  </div>
                </div>
                
                {/* Chat Interaction Card */}
                <div className="bg-white rounded-lg shadow p-3 w-64 border border-border/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Chat</span>
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2 mb-2 text-xs">
                    What were the main conclusions?
                  </div>
                  <div className="bg-primary/10 rounded-lg p-2 text-xs">
                    The team identified three key areas for improvement...
                  </div>
                </div>
              </div>
            </div>
            
            {/* Dropping File Animation */}
            <div className="absolute left-[15%] top-[-10%] animate-[slide-in_1s_ease-out]">
              <div className="relative animate-[fade-in_1s_ease-out]">
                <FileText className="h-10 w-10 text-violet-500 animate-[slide-in_1s_ease-out]" />
                <ArrowDown className="h-5 w-5 text-violet-500 absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 animate-bounce" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// File thumbnail component for the input files
interface FileThumbnailProps {
  icon: React.ReactNode;
  label: string;
  color: string;
}

const FileThumbnail: React.FC<FileThumbnailProps> = ({ icon, label, color }) => {
  return (
    <div className="flex items-center space-x-2 p-3 rounded-lg shadow-sm bg-white border border-border/30">
      <div className={`${color} p-2 rounded-md`}>
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};

export default HeroSection;
