
import React from 'react';

export const formatNoteContent = (text: string) => {
  if (!text) return "No content provided.";
  
  const lines = text.split('\n');
  
  return lines.map((line, index) => {
    // Handle bold, italic, and underline formatting first
    let formattedLine = line
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>');
    
    // Handle headers
    if (line.trim().match(/^#{1,6}\s/)) {
      const level = line.trim().match(/^#+/)[0].length;
      let fontSize;
      let className = "font-bold mb-3 mt-4 text-slate-800";
      
      switch(level) {
        case 1: fontSize = "1.4rem"; break;
        case 2: fontSize = "1.25rem"; break;
        case 3: fontSize = "1.15rem"; break;
        default: fontSize = "1.05rem";
      }
      
      return (
        <div 
          key={index} 
          className={className}
          style={{fontSize}}
          dangerouslySetInnerHTML={{__html: formattedLine.replace(/^#+\s*/, '')}}
        />
      );
    }
    
    // Handle list items (all types of list markers)
    if (line.trim().match(/^[-*•]\s/)) {
      // Extract the content after the list marker
      const listContent = formattedLine.replace(/^[-*•]\s/, '');
      
      return (
        <div key={index} className="flex ml-4 my-1.5">
          <span className="mr-2 text-primary">•</span>
          <span dangerouslySetInnerHTML={{__html: listContent}} />
        </div>
      );
    }
    
    // Regular paragraph with improved spacing
    return (
      <div key={index} className="my-2 text-slate-700" dangerouslySetInnerHTML={{__html: formattedLine}} />
    );
  });
};

// React component wrapper for displaying formatted note content
interface NoteContentDisplayProps {
  content: string | null;
  isPreview?: boolean;
}

const NoteContentDisplay: React.FC<NoteContentDisplayProps> = ({ content, isPreview = false }) => {
  if (!content) {
    return <div className="text-muted-foreground italic">No content provided.</div>;
  }
  
  // For preview, show a much shorter excerpt
  let displayContent = content;
  if (isPreview) {
    const firstParagraph = content.split('\n')[0] || '';
    displayContent = firstParagraph.length > 60 
      ? firstParagraph.substring(0, 60) + '...'
      : firstParagraph;
  }
  
  return (
    <div className={`whitespace-pre-wrap prose-sm max-w-none leading-relaxed ${isPreview ? 'line-clamp-1 text-xs' : ''}`}>
      {formatNoteContent(displayContent)}
    </div>
  );
};

export default NoteContentDisplay;
