
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizontal } from 'lucide-react';

interface ProjectChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ProjectChatInput: React.FC<ProjectChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
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
    <div className="flex gap-2">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask about your project..."
        className="min-h-[60px]"
        onKeyDown={handleKeyDown}
      />
      <Button
        onClick={handleSend}
        disabled={isLoading || !input.trim()}
        className="px-3"
      >
        <SendHorizontal className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ProjectChatInput;
