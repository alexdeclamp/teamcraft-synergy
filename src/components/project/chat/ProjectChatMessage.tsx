
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ProjectChatMessageProps {
  message: Message;
}

const ProjectChatMessage: React.FC<ProjectChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex items-start ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
          <Bot className="h-5 w-5" />
        </div>
      )}
      
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-accent/50 text-foreground'
        }`}
      >
        {isUser ? (
          <div>{message.content}</div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center ml-3">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  );
};

export default ProjectChatMessage;
