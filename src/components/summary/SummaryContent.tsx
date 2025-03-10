
import React from 'react';
import { Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SummaryContentProps {
  isLoading: boolean;
  summary: string;
  hasSummary: boolean;
}

const SummaryContent: React.FC<SummaryContentProps> = ({
  isLoading,
  summary,
  hasSummary
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Generating summary...</p>
      </div>
    );
  }

  // Format the summary content and handle markdown formatting
  const formatSummaryContent = (content: string) => {
    // Format markdown-style formatting by converting to HTML
    const formattedText = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/__(.*?)__/g, '<u>$1</u>'); // Underline

    // Check if content might contain a table structure
    const lines = content.split('\n');
    const potentialTableLines = lines.filter(line => 
      line.includes('|') || 
      line.includes('\t') || 
      (line.includes(':') && line.split(':').length > 1)
    );
    
    // If we detect a potential table structure
    if (potentialTableLines.length > 3 && potentialTableLines.length / lines.length > 0.4) {
      return (
        <div className="prose max-w-none">
          {lines.map((line, index) => {
            // Check if line looks like a table header or separator
            if (line.includes('--') && line.includes('|')) {
              return <hr key={index} className="my-1" />;
            }
            // Check if line looks like a table row
            else if (line.includes('|')) {
              const cells = line.split('|').filter(cell => cell.trim() !== '');
              return (
                <div key={index} className="grid grid-cols-12 gap-2 py-1 border-b border-border/50">
                  {cells.map((cell, cellIndex) => (
                    <div 
                      key={`${index}-${cellIndex}`}
                      className={cn(
                        "px-2", 
                        cellIndex === 0 ? "col-span-3 font-medium" : "col-span-9/cells.length",
                        index === 0 ? "font-semibold" : ""
                      )}
                      dangerouslySetInnerHTML={{ __html: cell.trim() }}
                    />
                  ))}
                </div>
              );
            } 
            // Format other content with proper paragraph styling
            else if (line.trim() !== '') {
              // Check if this is a heading (starts with # symbols)
              if (line.trim().startsWith('#')) {
                const level = line.trim().match(/^#+/)[0].length;
                const text = line.trim().replace(/^#+\s*/, '');
                const headingClass = cn(
                  "font-semibold", 
                  level === 1 ? "text-xl mt-4 mb-2" : 
                  level === 2 ? "text-lg mt-3 mb-2" : 
                  "text-base mt-2 mb-1"
                );
                return <div key={index} className={headingClass} dangerouslySetInnerHTML={{ __html: text }} />;
              }
              // Check if this is a list item
              else if (line.trim().match(/^[-*•]\s/)) {
                return (
                  <div key={index} className="ml-4 flex">
                    <span className="mr-2">•</span>
                    <span dangerouslySetInnerHTML={{ __html: line.trim().replace(/^[-*•]\s/, '') }} />
                  </div>
                );
              }
              // Regular paragraph with formatted content
              return <p key={index} className="my-1" dangerouslySetInnerHTML={{ __html: formattedText }} />;
            }
            return null;
          }).filter(Boolean)}
        </div>
      );
    }
    
    // Default rendering with formatted content
    return <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formattedText.replace(/\n/g, '<br/>') }} />;
  };

  // Only show the summary content if we explicitly know we have a summary
  if (hasSummary && summary.trim() !== '') {
    return (
      <>
        <div className="mb-2 px-2 text-sm text-muted-foreground flex items-center">
          <Save className="h-3 w-3 mr-1" />
          <span>Summary is saved and will be available instantly next time</span>
        </div>
        <div className="p-4 bg-accent/20 rounded-md overflow-y-auto max-h-[50vh]">
          {formatSummaryContent(summary)}
        </div>
      </>
    );
  }

  // Default "no summary" state
  return (
    <div className="p-4 bg-accent/10 rounded-md flex items-center justify-center h-32">
      <p className="text-muted-foreground">No summary available yet.</p>
    </div>
  );
};

export default SummaryContent;
