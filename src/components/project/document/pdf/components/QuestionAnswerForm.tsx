
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

interface QuestionAnswerFormProps {
  isLoading: boolean;
  onAskQuestion: (question: string) => void;
}

const QuestionAnswerForm: React.FC<QuestionAnswerFormProps> = ({ 
  isLoading, 
  onAskQuestion 
}) => {
  const [question, setQuestion] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }
    
    onAskQuestion(question.trim());
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
      <Input
        placeholder="Ask a question about this document..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        disabled={isLoading}
        className="flex-1"
      />
      <Button 
        type="submit" 
        size="sm" 
        disabled={isLoading || !question.trim()}
      >
        <Send className="h-4 w-4 mr-1" />
        Ask
      </Button>
    </form>
  );
};

export default QuestionAnswerForm;
