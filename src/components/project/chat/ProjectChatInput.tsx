
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizontal, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProjectChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const ProjectChatInput: React.FC<ProjectChatInputProps> = ({ 
  onSendMessage, 
  isLoading,
  disabled = false
}) => {
  const [input, setInput] = useState('');
  const isMobile = useIsMobile();

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-2 border-t border-border/50 pt-3">
      <div className="flex gap-2 items-end relative">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          className={`min-h-[80px] focus-visible:ring-primary/30 bg-background resize-none p-4 rounded-xl ${
            isMobile ? 'text-base' : ''
          } ${disabled ? 'opacity-60' : ''}`}
          onKeyDown={handleKeyDown}
          style={isMobile ? { fontSize: '16px' } : undefined}
          disabled={disabled}
        />
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim() || disabled}
            className="h-12 w-12 rounded-full flex-shrink-0 shadow-sm"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <SendHorizontal className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectChatInput;
