
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HomepageChatButtonProps {
  onClick: () => void;
  className?: string;
}

const HomepageChatButton: React.FC<HomepageChatButtonProps> = ({ 
  onClick,
  className
}) => {
  return (
    <div 
      className="fixed bottom-6 right-6 z-[999999]" 
      style={{ 
        pointerEvents: 'auto',
      }}
    >
      <Button
        onClick={onClick}
        className={cn(
          "h-20 w-20 rounded-full shadow-2xl bg-primary hover:bg-primary/90",
          "border-4 border-white animate-bounce",
          "flex items-center justify-center",
          className
        )}
        aria-label="Chat with Bra3n Assistant"
      >
        <MessageSquare className="h-10 w-10 text-white" />
      </Button>
    </div>
  );
};

export default HomepageChatButton;
