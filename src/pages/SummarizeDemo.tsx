
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, PaperclipIcon, Import } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const SummarizeDemo = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [text, setText] = useState('');
  const [showAuthDialog, setShowAuthDialog] = useState(false);

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

    // Process the summarization
    toast.success('Processing your summary request...');
    // Actual implementation would continue here if the user is logged in
  };

  const handleSignIn = () => {
    navigate('/auth?tab=login');
  };

  const handleSignUp = () => {
    navigate('/auth?tab=register');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Brain className="h-8 w-8 text-primary" />
          </div>
        </div>

        {/* Input Card */}
        <div className="bg-muted/20 rounded-xl border border-border/30 shadow-sm overflow-hidden">
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
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Import className="h-4 w-4 mr-1" />
                Import
              </Button>
            </div>
            
            <Button onClick={handleSummarize} className="gap-1.5">
              <Brain className="h-4 w-4" />
              Summarize
            </Button>
          </div>
        </div>

        {/* Auth Dialog */}
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
