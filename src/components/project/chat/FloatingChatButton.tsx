
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingChatButtonProps {
  onClick: () => void;
  className?: string;
  isMobile?: boolean;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ 
  onClick,
  className,
  isMobile = false
}) => {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        "h-14 w-14 rounded-full shadow-lg z-40 bg-primary hover:bg-primary/90 transition-all duration-200 animate-fade-in",
        isMobile ? "fixed bottom-20 right-6" : "fixed bottom-6 right-6",
        className
      )}
      aria-label="Open project assistant"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
};

export default FloatingChatButton;
