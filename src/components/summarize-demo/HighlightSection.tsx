
import React from 'react';

const HighlightSection = () => {
  return (
    <div className="w-full max-w-5xl mx-auto mb-20 bg-primary/5 py-16 px-8 rounded-xl border border-primary/20">
      <div className="text-center mb-12">
        <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground">
          Build high quality software<br />without writing code.
        </h2>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Creating software has never been more accessible. With Bra3n, simply describe
          your idea in your own words, and watch it transform into a fully functional application
          with beautiful aesthetics.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 mt-20">
        <div className="space-y-8">
          <div className="mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">20× faster than coding.</h3>
            <div className="w-16 h-0.5 bg-primary mb-6"></div>
            <p className="text-muted-foreground">
              Use your native language to describe your idea, then watch
              Bra3n do the rest. Creating for the web is faster and easier than
              ever before.
            </p>
          </div>
          
          <div className="mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">Prompt to edit.</h3>
            <div className="w-16 h-0.5 bg-primary mb-6"></div>
            <p className="text-muted-foreground">
              Forget about the overhead of frontend engineers or freelancers to
              maintain your website. Ask in text to change anything.
            </p>
          </div>
          
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">You own the code.</h3>
            <div className="w-16 h-0.5 bg-primary mb-6"></div>
            <p className="text-muted-foreground">
              Everything that Bra3n builds is yours. Sync your codebase to
              Github and edit in any code editor, export or publish your app
              instantly with one click.
            </p>
          </div>
        </div>
        
        <div className="relative">
          <div className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl overflow-hidden shadow-lg">
            <img 
              src="/lovable-uploads/8d69913a-49e9-46f0-bea0-efdc9a28fc72.png" 
              alt="AI editing interface" 
              className="w-full h-auto rounded-xl border border-primary/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HighlightSection;
