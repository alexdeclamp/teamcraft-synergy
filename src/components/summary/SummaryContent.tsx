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
    // Check if content is empty
    if (!content || content.trim() === '') {
      return <p>No content available</p>;
    }

    // Split content by lines to process line by line
    const lines = content.split('\n');
    
    return (
      <div className="prose max-w-none">
        {lines.map((line, index) => {
          // Skip empty lines but keep spacing
          if (line.trim() === '') {
            return <div key={index} className="my-1"></div>;
          }
          
          // Format the line with markdown syntax
          const formattedLine = line
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>')              // Italic
            .replace(/__(.*?)__/g, '<u>$1</u>');               // Underline
          
          // Handle headings (lines starting with #)
          if (line.trim().match(/^#{1,6}\s/)) {
            const level = line.trim().match(/^#+/)[0].length;
            const headingClass = `heading-${level}`;
            const fontSize = 6 - level + 0.8; // Scale heading size
            
            return (
              <div 
                key={index} 
                className={`font-bold mb-2 mt-3`} 
                style={{fontSize: `${fontSize}rem`}}
                dangerouslySetInnerHTML={{__html: formattedLine.replace(/^#+\s*/, '')}}
              />
            );
          }
          
          // Handle list items
          if (line.trim().match(/^[-*•]\s/)) {
            return (
              <div key={index} className="flex ml-4 my-1">
                <span className="mr-2">•</span>
                <span dangerouslySetInnerHTML={{__html: formattedLine.replace(/^[-*•]\s/, '')}} />
              </div>
            );
          }
          
          // Check if line looks like a table separator
          if (line.includes('--') && line.includes('|')) {
            return <hr key={index} className="my-1" />;
          }
          
          // Check if line looks like a table row
          if (line.includes('|')) {
            const cells = line.split('|').filter(cell => cell.trim() !== '');
            return (
              <div key={index} className="grid grid-cols-12 gap-2 py-1 border-b border-border/50">
                {cells.map((cell, cellIndex) => {
                  // Apply markdown formatting to cell content
                  const formattedCell = cell.trim()
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/__(.*?)__/g, '<u>$1</u>');
                  
                  return (
                    <div 
                      key={`${index}-${cellIndex}`}
                      className={cn(
                        "px-2", 
                        cellIndex === 0 ? "col-span-3 font-medium" : "col-span-9/cells.length",
                        index === 0 ? "font-semibold" : ""
                      )}
                      dangerouslySetInnerHTML={{ __html: formattedCell }}
                    />
                  );
                })}
              </div>
            );
          }
          
          // Handle regular paragraph with spacing
          return (
            <div 
              key={index} 
              className="my-1"
              dangerouslySetInnerHTML={{ __html: formattedLine }}
            />
          );
        })}
      </div>
    );
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
