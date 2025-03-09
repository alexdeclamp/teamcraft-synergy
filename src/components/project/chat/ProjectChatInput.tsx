
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizontal } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProjectChatInputProps {
  onSendMessage: (message: string, model: string) => void;
  isLoading: boolean;
}

const ProjectChatInput: React.FC<ProjectChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('openai');

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input, selectedModel);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className="w-[140px] sm:w-[180px]">
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI (GPT-4o mini)</SelectItem>
            <SelectItem value="claude">Claude</SelectItem>
          </SelectContent>
        </Select>
      </div>
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
          className="px-3 flex-shrink-0"
          aria-label="Send message"
        >
          <SendHorizontal className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ProjectChatInput;
