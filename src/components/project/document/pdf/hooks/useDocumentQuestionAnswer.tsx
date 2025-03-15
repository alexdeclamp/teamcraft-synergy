
import { useState } from 'react';
import { toast } from 'sonner';

interface UseDocumentQuestionAnswerProps {
  pdfUrl: string;
  fileName: string;
  extractedText: string;
  projectId?: string;
}

export const useDocumentQuestionAnswer = ({
  pdfUrl,
  fileName,
  extractedText,
  projectId
}: UseDocumentQuestionAnswerProps) => {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);

  const askQuestion = async (question: string) => {
    if (!extractedText) {
      toast.error('No document text available to answer questions from');
      return;
    }

    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setCurrentQuestion(question);
    setIsAnswering(true);
    setAnswer('');

    try {
      const response = await fetch('/functions/v1/ask-pdf-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfUrl,
          fileName,
          userQuestion: question,
          documentContext: extractedText,
          projectId
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get answer: ${response.status} ${errorText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.answer) {
        setAnswer(data.answer);
      } else {
        throw new Error('Received empty answer from service');
      }
    } catch (error: any) {
      console.error('Error getting answer:', error);
      toast.error('Failed to get answer', {
        description: error.message || 'An unexpected error occurred',
      });
      setAnswer('');
    } finally {
      setIsAnswering(false);
    }
  };

  return {
    currentQuestion,
    answer,
    isAnswering,
    askQuestion,
  };
};
