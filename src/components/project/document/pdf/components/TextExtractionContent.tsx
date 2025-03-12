
import React, { useRef } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

interface TextExtractionContentProps {
  isExtracting: boolean;
  isSummarizing: boolean;
  extractionError: string | null;
  extractedText: string;
  summary: string;
  showSummary: boolean;
  onRetryExtraction: () => void;
  handleOpenPdfDirectly: () => void;
}

const TextExtractionContent: React.FC<TextExtractionContentProps> = ({
  isExtracting,
  isSummarizing,
  extractionError,
  extractedText,
  summary,
  showSummary,
  onRetryExtraction,
  handleOpenPdfDirectly
}) => {
  const textContainerRef = useRef<HTMLPreElement>(null);

  const formatExtractedText = (text: string) => {
    if (!text) return '';
    
    // Convert "Heading:" and "Subheading:" patterns to markdown
    let formatted = text
      // Convert "Heading:" to markdown heading
      .replace(/^Heading:\s*(.*?)$/gm, '# $1')
      .replace(/^Subheading:\s*(.*?)$/gm, '## $1')
      // Ensure double line breaks between sections
      .replace(/\n(#+ )/g, '\n\n$1')
      // Fix bullet points
      .replace(/^[-*•]\s*/gm, '• ')
      // Ensure proper spacing between paragraphs
      .replace(/([^\n])\n([^\s#•-])/g, '$1\n\n$2')
      // Remove extra spaces
      .replace(/\s{3,}/g, '\n\n')
      // Ensure proper heading spacing
      .replace(/^(#+ .*)\n([^\n])/gm, '$1\n\n$2');
    
    return formatted.trim();
  };

  const getSelectedText = () => {
    if (textContainerRef.current) {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        let selectedText = selection.toString();
        // Format as a blockquote for note creation
        return `> ${selectedText.replace(/\n/g, '\n> ')}`;
      }
    }
    return '';
  };

  if (isExtracting) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
        <span className="text-muted-foreground">Extracting text from PDF...</span>
        <span className="text-xs text-muted-foreground mt-1">This may take a moment for large files</span>
      </div>
    );
  }

  if (isSummarizing) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
        <span className="text-muted-foreground">Summarizing text...</span>
        <span className="text-xs text-muted-foreground mt-1">This may take a moment for large documents</span>
      </div>
    );
  }

  if (extractionError) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <div className="text-destructive mb-4">{extractionError}</div>
        <div className="text-sm text-muted-foreground mb-6 max-w-md">
          This could be due to network issues, an invalid PDF format, or the PDF might be password-protected.
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={onRetryExtraction}>Retry Extraction</Button>
          <Button variant="outline" onClick={handleOpenPdfDirectly} className="flex items-center gap-1">
            <ExternalLink className="h-4 w-4" />
            Open PDF Directly
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4 mt-4 max-h-[500px] overflow-auto">
      {showSummary && summary ? (
        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:mt-6 prose-headings:mb-4">
          <ReactMarkdown>
            {formatExtractedText(summary)}
          </ReactMarkdown>
        </div>
      ) : extractedText ? (
        <pre 
          ref={textContainerRef}
          className="whitespace-pre-wrap font-sans text-sm w-full overflow-visible leading-relaxed p-2"
        >
          {formatExtractedText(extractedText)}
        </pre>
      ) : (
        <div className="text-center text-muted-foreground py-8">
          No text content was extracted from this PDF. It might be an image-based PDF.
        </div>
      )}
    </ScrollArea>
  );
};

export default TextExtractionContent;
