import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, MessageSquare, Users, Map, FileText, Brain, PaperclipIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import Logo from '@/components/navbar/Logo';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import SummaryResult from '@/components/summarize-demo/SummaryResult';

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [text, setText] = useState('');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSummarize = () => {
    setShowAuthDialog(true);
  };

  const handleSignIn = () => {
    navigate('/auth?tab=login');
  };

  const handleSignUp = () => {
    navigate('/auth?tab=register');
  };

  const handleTrySummarizeDemo = () => {
    navigate('/summarize');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="w-full py-4 px-6 border-b border-border/30 sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo />
          
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleSignIn}>Sign In</Button>
            <Button onClick={handleSignUp}>Sign Up</Button>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col items-center pt-16 md:pt-20 px-6">
        <div className="w-full max-w-3xl mx-auto pb-8">
          <div className="flex justify-center mb-8">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Summarize any document in seconds</h1>
            <p className="text-xl text-muted-foreground">
              Bra3n is a next-gen collaborative knowledge management system
            </p>
          </div>

          <div className="bg-muted/20 rounded-xl border border-border/30 shadow-sm overflow-hidden mb-10">
            <Textarea
              placeholder="Ask Bra3n to summarize any text or document..."
              value={text}
              onChange={handleTextChange}
              className="min-h-[120px] border-0 bg-transparent focus-visible:ring-0 resize-none p-4 text-base"
            />
            
            <div className="flex items-center justify-between p-3 border-t border-border/30 bg-background/50">
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <PaperclipIcon className="h-4 w-4 mr-1" />
                  Attach
                </Button>
              </div>
              
              <Button onClick={handleSummarize} className="gap-1.5">
                <Brain className="h-4 w-4" />
                Summarize
              </Button>
            </div>
          </div>

          <SummaryResult summary={summary} isGenerating={isGenerating} />
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/auth?tab=register')} 
              size="lg" 
              className="rounded-md px-8 text-base shadow-sm w-full sm:w-auto bg-primary hover:bg-primary/90"
            >
              Get Started
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            
            <Button 
              onClick={handleTrySummarizeDemo}
              variant="outline" 
              size="lg"
              className="rounded-md px-8 text-base w-full sm:w-auto border-primary/20 bg-white shadow-[0_0_15px_rgba(155,135,245,0.2)] hover:bg-white/90"
            >
              <FileText className="mr-2 h-4 w-4" />
              Try Full Demo
            </Button>
          </div>
        </div>
      </div>
      
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in required</DialogTitle>
            <DialogDescription>
              You need to be signed in to use the summarization feature.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
            <Button variant="outline" className="w-full sm:w-auto" onClick={handleSignIn}>
              Sign In
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleSignUp}>
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="mt-auto py-4 border-t">
        <div className="max-w-4xl mx-auto px-6 flex justify-center">
          <Link to="/sitemap" className="text-sm text-muted-foreground flex items-center hover:text-foreground transition-colors">
            <Map className="mr-1 h-3.5 w-3.5" />
            Sitemap
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default Index;
