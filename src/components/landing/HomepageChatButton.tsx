
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
        "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40 bg-primary hover:bg-primary/90 transition-all duration-200 animate-fade-in",
        className
      )}
      aria-label="Chat with Bra3n Assistant"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
};

export default HomepageChatButton;
