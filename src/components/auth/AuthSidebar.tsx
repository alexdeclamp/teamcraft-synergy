
import React from 'react';
import { Sparkles, Brain, LockIcon } from 'lucide-react';

const AuthSidebar = () => {
  return (
    <div className="hidden md:flex flex-col justify-between w-80 h-full min-h-screen bg-primary/5 border-r border-primary/10 p-6">
      <div>
        <div className="flex items-center gap-2 mb-10">
          <Brain className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">5th Brain</h1>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Welcome to 5th Brain</h2>
          <p className="text-muted-foreground">
            Your personal AI assistant for organizing and enhancing your knowledge.
          </p>

          <div className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">AI-Powered Knowledge Base</h3>
                  <p className="text-sm text-muted-foreground">
                    Organize and enhance your notes with artificial intelligence.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <LockIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Private & Secure</h3>
                  <p className="text-sm text-muted-foreground">
                    Your data is encrypted and never shared with third parties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} 5th Brain. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AuthSidebar;
