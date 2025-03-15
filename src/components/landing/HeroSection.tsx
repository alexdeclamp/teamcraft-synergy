
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Brain, MessageSquare, FileImage, FileText, ChevronDown, Zap, File } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  return (
    <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-70" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl opacity-70" />
      </div>
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left column - Hero text */}
          <div className="text-center lg:text-left lg:pr-8">
            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered Knowledge Hub
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-4">
              Bra<span className="text-primary">3</span>n
            </h1>
            <p className="text-2xl sm:text-3xl font-medium text-foreground mb-4">Your AI Project Assistant.</p>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8">Turn any documents into actionable insights instantly with AI-powered summaries and search.</p>
            <Button onClick={() => navigate('/auth?tab=register')} size="lg" className="rounded-full px-8 text-base shadow-sm">
              Try Bra3n
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          {/* Right column - Visual illustration */}
          <div className="relative bg-background/80 backdrop-blur-sm rounded-xl shadow-lg border border-border/30 overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-primary/30 via-primary to-accent/50"></div>
            
            {/* Flow visualization */}
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium mb-2">How It Works</h3>
                <p className="text-sm text-muted-foreground">Upload your documents and get instant AI-powered insights</p>
              </div>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                {/* Input Files - Left Side */}
                <div className="flex flex-col items-center gap-3 md:w-1/4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Your Documents</h4>
                  <div className="animate-bounce-slow delay-100 bg-background rounded-lg p-3 shadow-md border border-border/30 flex items-center gap-2 w-full">
                    <File className="h-6 w-6 text-red-500" />
                    <span className="font-medium text-sm">Report.pdf</span>
                  </div>
                  <div className="animate-bounce-slow delay-300 bg-background rounded-lg p-3 shadow-md border border-border/30 flex items-center gap-2 w-full">
                    <FileImage className="h-6 w-6 text-blue-500" />
                    <span className="font-medium text-sm">Diagram.png</span>
                  </div>
                  <div className="animate-bounce-slow delay-500 bg-background rounded-lg p-3 shadow-md border border-border/30 flex items-center gap-2 w-full">
                    <FileText className="h-6 w-6 text-green-500" />
                    <span className="font-medium text-sm">Notes.txt</span>
                  </div>
                </div>
                
                {/* Arrow pointing right - Desktop only */}
                <div className="hidden md:flex items-center">
                  <ArrowRight className="h-10 w-10 text-primary animate-pulse" />
                </div>
                
                {/* Arrow pointing down - Mobile only */}
                <div className="flex md:hidden items-center justify-center">
                  <ChevronDown className="h-10 w-10 text-primary animate-pulse" />
                </div>
                
                {/* Processing/Brain - Middle */}
                <div className="bg-background p-4 rounded-xl shadow-md border border-primary/20 md:w-1/3">
                  <div className="flex items-center justify-center mb-3">
                    <Brain className="h-12 w-12 text-primary animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-primary/20 rounded-full w-full animate-pulse"></div>
                    <div className="h-2 bg-primary/10 rounded-full w-5/6 mx-auto animate-pulse delay-100"></div>
                    <div className="h-2 bg-primary/20 rounded-full w-4/6 mx-auto animate-pulse delay-200"></div>
                  </div>
                  <div className="flex justify-center mt-2">
                    <Zap className="h-6 w-6 text-primary animate-pulse" />
                  </div>
                </div>
                
                {/* Arrow pointing right - Desktop only */}
                <div className="hidden md:flex items-center">
                  <ArrowRight className="h-10 w-10 text-primary animate-pulse" />
                </div>
                
                {/* Arrow pointing down - Mobile only */}
                <div className="flex md:hidden items-center justify-center">
                  <ChevronDown className="h-10 w-10 text-primary animate-pulse" />
                </div>
                
                {/* Output/Results - Right Side */}
                <div className="flex flex-col gap-3 md:w-1/4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 text-center">AI Insights</h4>
                  
                  <div className="bg-background rounded-lg p-3 shadow-md border border-border/30">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="font-medium text-sm">Key Summary</span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-2 bg-muted rounded-full w-full"></div>
                      <div className="h-2 bg-muted rounded-full w-5/6"></div>
                      <div className="h-2 bg-muted rounded-full w-4/6"></div>
                    </div>
                  </div>
                  
                  <div className="bg-background rounded-lg p-3 shadow-md border border-border/30">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <span className="font-medium text-sm">AI Chat</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full bg-primary/20 flex-shrink-0"></div>
                        <div className="h-2 bg-muted rounded-full w-3/4"></div>
                      </div>
                      <div className="flex items-center gap-1 justify-end">
                        <div className="h-2 bg-primary/20 rounded-full w-2/3"></div>
                        <div className="w-4 h-4 rounded-full bg-foreground/10 flex-shrink-0"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave separator */}
      <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full">
          <path fill="hsla(var(--background))" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,224C672,213,768,171,864,149.3C960,128,1056,128,1152,138.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
