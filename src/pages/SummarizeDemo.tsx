import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, PaperclipIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import SummaryResult from '@/components/summarize-demo/SummaryResult';
import FourStepsSection from '@/components/summarize-demo/FourStepsSection';
import FeaturesSection from '@/components/summarize-demo/FeaturesSection';
import HighlightSection from '@/components/summarize-demo/HighlightSection';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from '@/components/ui/navigation-menu';
import { Separator } from '@/components/ui/separator';
import Logo from '@/components/navbar/Logo';

const SummarizeDemo = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [text, setText] = useState('');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSummarize = () => {
    if (!session) {
      setShowAuthDialog(true);
      return;
    }

    if (text.trim().length < 50) {
      toast.error('Please enter at least 50 characters to generate a meaningful summary');
      return;
    }

    setIsGenerating(true);
    
    setTimeout(() => {
      const demoSummary = `# Summary of Document

## Key Points
• The document discusses advanced knowledge management techniques
• It highlights the importance of AI in document processing
• Several case studies demonstrate successful implementation

## Recommendations
• Implement a centralized knowledge repository
• Use AI tools for automatic document classification
• Regularly update and maintain the knowledge base`;
      
      setSummary(demoSummary);
      setIsGenerating(false);
      toast.success('Summary generated successfully!');
    }, 2000);
  };

  const handleSignIn = () => {
    navigate('/auth?tab=login');
  };

  const handleSignUp = () => {
    navigate('/auth?tab=register');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/30 py-4 px-6 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Logo />
          
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              <NavigationMenuItem>
                <NavigationMenuLink 
                  className="px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                  href="#features"
                >
                  Features
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink 
                  className="px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                  href="#pricing"
                >
                  Pricing
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink 
                  className="px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                  href="#about"
                >
                  About
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleSignIn}>Sign In</Button>
            <Button onClick={handleSignUp}>Sign Up</Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-3xl mx-auto mb-8">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Summarize any document in seconds</h1>
            <p className="text-xl text-muted-foreground">
              Bra3n is a next-gen collaborative knowledge management system
            </p>
          </div>

          <div className="bg-muted/20 rounded-xl border border-border/30 shadow-sm overflow-hidden mb-8">
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
        </div>

        <Separator className="max-w-3xl w-full my-16 opacity-50" />

        <FourStepsSection />
        
        <Separator className="max-w-3xl w-full my-16 opacity-50" />
        
        <FeaturesSection />
        
        <Separator className="max-w-3xl w-full my-16 opacity-50" />
        
        <HighlightSection />
        
        <Separator className="max-w-3xl w-full my-16 opacity-50" />
        
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
      </div>
    </div>
  );
};

export default SummarizeDemo;
