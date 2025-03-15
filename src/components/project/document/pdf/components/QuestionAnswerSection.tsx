
import React, { useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface QuestionAnswerSectionProps {
  extractedText: string;
}

const QuestionAnswerSection: React.FC<QuestionAnswerSectionProps> = ({
  extractedText
}) => {
  const [question, setQuestion] = useState('');
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [answer, setAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question first");
      return;
    }

    if (!extractedText) {
      toast.error("No document text to analyze");
      return;
    }

    setIsAskingQuestion(true);
    setShowAnswer(false);
    setAnswer('');

    try {
      const toastId = toast.loading("Analyzing your document to answer your question...");

      const { data, error } = await supabase.functions.invoke('ask-pdf-question', {
        body: {
          userQuestion: question,
          documentContext: extractedText,
          fileName: 'PDF Document' // You might want to pass the actual filename
        }
      });

      toast.dismiss(toastId);

      if (error) {
        console.error('Error asking question:', error);
        toast.error("Failed to answer your question", {
          description: error.message || "An unexpected error occurred"
        });
        return;
      }

      if (data.answer) {
        setAnswer(data.answer);
        setShowAnswer(true);
        toast.success("Question answered successfully");
      } else {
        toast.error("No answer was generated", {
          description: "Try rephrasing your question or using a different document"
        });
      }
    } catch (error: any) {
      console.error('Error in ask question flow:', error);
      toast.error("Failed to process your question", {
        description: error.message || "An unexpected error occurred"
      });
    } finally {
      setIsAskingQuestion(false);
    }
  };

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium mb-2">Ask a question about this document</h3>
      <div className="flex flex-col space-y-2">
        <Textarea 
          placeholder="Enter your question here..."
          value={question}
          onChange={handleQuestionChange}
          className="min-h-[60px]"
        />
        <Button 
          onClick={handleAskQuestion} 
          disabled={isAskingQuestion || !question.trim()}
          className="self-end"
        >
          {isAskingQuestion ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Ask Question
            </>
          )}
        </Button>
      </div>
      
      {showAnswer && answer && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <h4 className="font-medium text-green-800 mb-2">Answer:</h4>
          <div className="text-sm text-green-900 whitespace-pre-wrap max-h-[200px] overflow-y-auto">
            {answer}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionAnswerSection;
