
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizontal, Loader2, Bot, Sparkles } from 'lucide-react';
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
      <div className="flex gap-2 items-end relative">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          className="min-h-[80px] focus-visible:ring-primary/30 bg-white resize-none p-4 rounded-xl"
          onKeyDown={handleKeyDown}
        />
        <div className="flex flex-col gap-2">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-12 h-12 p-0 justify-center rounded-full bg-white border border-muted shadow-sm">
              {selectedModel === 'openai' ? (
                <Sparkles className="h-5 w-5 text-blue-500" />
              ) : (
                <Bot className="h-5 w-5 text-purple-500" />
              )}
              <SelectValue className="sr-only" />
            </SelectTrigger>
            <SelectContent align="end" side="top">
              <SelectItem value="openai" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span>OpenAI (GPT-4o mini)</span>
              </SelectItem>
              <SelectItem value="claude" className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-purple-500" />
                <span>Claude</span>
              </SelectItem>
            </SelectContent>
          </Select>
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
      <div className="flex justify-end pr-16">
        <p className="text-xs text-muted-foreground">
          Using {selectedModel === 'openai' ? 'OpenAI (GPT-4o mini)' : 'Claude'}
        </p>
      </div>
    </div>
  );
};

export default ProjectChatInput;
