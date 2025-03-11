
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
      <div className="flex items-center gap-3 mb-2">
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className="w-[180px] h-9 bg-white">
            <div className="flex items-center">
              {selectedModel === 'openai' ? (
                <Sparkles className="h-4 w-4 text-blue-500 mr-2" />
              ) : (
                <Bot className="h-4 w-4 text-purple-500 mr-2" />
              )}
              <span>{selectedModel === 'openai' ? 'OpenAI (GPT-4o mini)' : 'Claude'}</span>
            </div>
          </SelectTrigger>
          <SelectContent>
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
