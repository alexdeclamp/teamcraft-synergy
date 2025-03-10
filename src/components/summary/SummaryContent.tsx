
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

  const formatSummaryContent = (content: string) => {
    if (!content || content.trim() === '') {
      return <p>No content available</p>;
    }

    // Pre-process the text to fix common formatting issues
    content = content
      // Ensure consistent line breaks
      .replace(/\r\n/g, '\n')
      // Fix inconsistent spacing around headings
      .replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2')
      // Ensure proper spacing after headings
      .replace(/^(#{1,6}\s[^\n]+)(?!\n\n)/gm, '$1\n\n')
      // Ensure proper spacing between paragraphs that aren't headings or lists
      .replace(/([^\n])\n([^#\s•*-])/g, '$1\n\n$2')
      // Normalize bullet points
      .replace(/^[-*•]\s*/gm, '• ');

    const lines = content.split('\n');
    
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        {lines.map((line, index) => {
          // Handle empty lines as paragraph breaks
          if (line.trim() === '') {
            return <div key={`space-${index}`} className="my-3"></div>;
          }
          
          // Process text formatting (bold, italic, underline)
          const formattedLine = line
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/__(.*?)__/g, '<u>$1</u>')
            .replace(/^\* /, '• ');
          
          // Handle headings with different levels
          if (line.trim().match(/^#{1,6}\s/)) {
            const level = line.trim().match(/^#+/)[0].length;
            const classes = "font-bold mt-5 mb-3";
            let fontSize;
            
            switch(level) {
              case 1: fontSize = "1.5rem"; break;
              case 2: fontSize = "1.3rem"; break;
              case 3: fontSize = "1.2rem"; break;
              case 4: fontSize = "1.1rem"; break;
              default: fontSize = "1rem";
            }
            
            return (
              <div 
                key={`heading-${index}`} 
                className={classes} 
                style={{fontSize}}
                dangerouslySetInnerHTML={{__html: formattedLine.replace(/^#+\s*/, '')}}
              />
            );
          }
          
          // Handle bullet points
          if (line.trim().match(/^[•*-]\s/)) {
            return (
              <div key={`bullet-${index}`} className="flex ml-4 my-2">
                <span className="mr-2">•</span>
                <span dangerouslySetInnerHTML={{__html: formattedLine.replace(/^[•*-]\s/, '')}} />
              </div>
            );
          }
          
          // Handle horizontal rules
          if (line.includes('--') && line.includes('|')) {
            return <hr key={`hr-${index}`} className="my-2" />;
          }
          
          // Handle table rows
          if (line.includes('|')) {
            const cells = line.split('|').filter(cell => cell.trim() !== '');
            return (
              <div key={`table-${index}`} className="grid grid-cols-12 gap-2 py-2 border-b border-border/50">
                {cells.map((cell, cellIndex) => {
                  const formattedCell = cell.trim()
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/__(.*?)__/g, '<u>$1</u>');
                  
                  return (
                    <div 
                      key={`cell-${index}-${cellIndex}`}
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
          
          // Regular paragraph with improved spacing
          return (
            <div 
              key={`para-${index}`} 
              className="my-2 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formattedLine }}
            />
          );
        })}
      </div>
    );
  };

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

  return (
    <div className="p-4 bg-accent/10 rounded-md flex items-center justify-center h-32">
      <p className="text-muted-foreground">No summary available yet.</p>
    </div>
  );
};

export default SummaryContent;
