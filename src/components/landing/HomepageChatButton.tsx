
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
    <div className="fixed bottom-4 right-4 z-[99999]" style={{ pointerEvents: 'auto' }}>
      <Button
        onClick={onClick}
        variant="default"
        className={cn(
          "h-16 w-16 rounded-full shadow-lg bg-primary hover:bg-primary/90",
          "animate-pulse border-4 border-white",
          "flex items-center justify-center",
          className
        )}
        aria-label="Chat with Bra3n Assistant"
      >
        <MessageSquare className="h-8 w-8 text-white" />
      </Button>
    </div>
  );
};

export default HomepageChatButton;
