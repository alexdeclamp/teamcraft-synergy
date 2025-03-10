
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Bold, Italic, Underline } from 'lucide-react';

interface NotesFormattingProps {
  contentId: string;
}

const NotesFormatting: React.FC<NotesFormattingProps> = ({ contentId }) => {
  const applyFormatting = (type: 'bold' | 'italic' | 'underline') => {
    const textarea = document.getElementById(contentId) as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    if (start === end) {
      let formattedText = '';
      let placeholder = 'text';
      
      switch (type) {
        case 'bold':
          formattedText = `**${placeholder}**`;
          break;
        case 'italic':
          formattedText = `*${placeholder}*`;
          break;
        case 'underline':
          formattedText = `__${placeholder}__`;
          break;
      }
      
      const newContent = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Need to update the textarea and trigger an event for React state to update
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, "value"
      )?.set;
      
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(textarea, newContent);
        const event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);
      }
      
      setTimeout(() => {
        textarea.focus();
        const placeholderStart = start + (type === 'bold' || type === 'underline' ? 2 : 1);
        textarea.setSelectionRange(placeholderStart, placeholderStart + placeholder.length);
      }, 0);
    } else {
      let formattedText = '';
      
      switch (type) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `*${selectedText}*`;
          break;
        case 'underline':
          formattedText = `__${selectedText}__`;
          break;
      }
      
      const newContent = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Need to update the textarea and trigger an event for React state to update
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, "value"
      )?.set;
      
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(textarea, newContent);
        const event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);
      }
      
      const newCursorPos = start + formattedText.length;
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  return (
    <div className="flex space-x-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => applyFormatting('bold')}>
              <Bold className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Bold</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => applyFormatting('italic')}>
              <Italic className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Italic</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => applyFormatting('underline')}>
              <Underline className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Underline</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default NotesFormatting;
