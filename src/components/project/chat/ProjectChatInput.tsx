
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizontal, Loader2 } from 'lucide-react';
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
    <div className="space-y-3">
      <div className="flex justify-end">
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className="w-[140px] sm:w-[180px] bg-white border-muted">
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI (GPT-4o mini)</SelectItem>
            <SelectItem value="claude">Claude</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 items-end">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          className="min-h-[80px] focus-visible:ring-primary/30 bg-white resize-none p-4 rounded-xl"
          onKeyDown={handleKeyDown}
        />
        <Button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
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
  );
};

export default ProjectChatInput;
