
import React from 'react';

export const formatNoteContent = (text: string) => {
  if (!text) return "No content provided.";
  
  // Pre-process the text to fix common formatting issues
  text = text
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
  
  const lines = text.split('\n');
  
  return lines.map((line, index) => {
    // Handle empty lines as paragraph breaks
    if (line.trim() === '') {
      return <div key={`space-${index}`} className="h-4"></div>;
    }
    
    // Process text formatting (bold, italic, underline)
    let formattedLine = line
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>');
    
    // Handle headings
    if (line.trim().match(/^#{1,6}\s/)) {
      const level = line.trim().match(/^#+/)[0].length;
      let fontSize;
      let className = "font-bold mb-3 mt-5 text-slate-800";
      
      switch(level) {
        case 1: fontSize = "1.5rem"; break;
        case 2: fontSize = "1.3rem"; break;
        case 3: fontSize = "1.2rem"; break;
        default: fontSize = "1.1rem";
      }
      
      return (
        <div 
          key={`heading-${index}`} 
          className={className}
          style={{fontSize}}
          dangerouslySetInnerHTML={{__html: formattedLine.replace(/^#+\s*/, '')}}
        />
      );
    }
    
    // Handle bullet points (all types of list markers)
    if (line.trim().match(/^[•*-]\s/)) {
      // Extract the content after the list marker
      const listContent = formattedLine.replace(/^[•*-]\s/, '');
      
      return (
        <div key={`bullet-${index}`} className="flex ml-4 my-2">
          <span className="mr-2 text-primary">•</span>
          <span dangerouslySetInnerHTML={{__html: listContent}} />
        </div>
      );
    }
    
    // Regular paragraph with improved spacing
    return (
      <div key={`para-${index}`} className="my-2 text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{__html: formattedLine}} />
    );
  });
};

interface NoteContentDisplayProps {
  content: string | null;
  isPreview?: boolean;
}

const NoteContentDisplay: React.FC<NoteContentDisplayProps> = ({ content, isPreview = false }) => {
  if (!content) {
    return <div className="text-muted-foreground italic">No content provided.</div>;
  }
  
  // For preview, show more content but with smaller font
  let displayContent = content;
  if (isPreview) {
    const firstParagraph = content.split('\n')[0] || '';
    displayContent = firstParagraph.length > 500 
      ? firstParagraph.substring(0, 500) + '...'
      : firstParagraph;
  }
  
  return (
    <div className={`whitespace-pre-wrap prose-sm max-w-none leading-relaxed ${isPreview ? 'line-clamp-2 text-[6px]' : ''}`}>
      {formatNoteContent(displayContent)}
    </div>
  );
};

export default NoteContentDisplay;
