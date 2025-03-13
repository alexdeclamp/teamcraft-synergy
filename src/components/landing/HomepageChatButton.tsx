
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
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 h-20 w-20 z-[9999999]",
        "rounded-full shadow-2xl bg-red-500 hover:bg-red-600",
        "border-4 border-white animate-bounce",
        "flex items-center justify-center",
        className
      )}
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 9999999
      }}
      aria-label="Chat with Bra3n Assistant"
    >
      <MessageSquare className="h-10 w-10 text-white" />
    </Button>
  );
};

export default HomepageChatButton;
