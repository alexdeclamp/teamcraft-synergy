
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
        "fixed bottom-8 right-8 h-20 w-20 rounded-full shadow-2xl z-[9999] bg-primary hover:bg-primary/90",
        "animate-bounce", // More noticeable animation
        "transition-all duration-300",
        className
      )}
      aria-label="Chat with Bra3n Assistant"
    >
      <MessageCircle className="h-9 w-9" />
    </Button>
  );
};

export default HomepageChatButton;
