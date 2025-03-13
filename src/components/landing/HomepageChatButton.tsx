
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
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
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        "fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-xl z-50 bg-primary hover:bg-primary/90",
        "animate-bounce", // Changed from pulse to bounce for more attention
        "transition-all duration-300",
        className
      )}
      aria-label="Chat with Bra3n Assistant"
    >
      <MessageCircle className="h-7 w-7" />
    </Button>
  );
};

export default HomepageChatButton;
