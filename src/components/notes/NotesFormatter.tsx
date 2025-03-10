
import React from 'react';

export const formatNoteContent = (text: string) => {
  if (!text) return "No content provided.";
  
  const lines = text.split('\n');
  
  return lines.map((line, index) => {
    let formattedLine = line
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/^\* /, '• ');
    
    if (line.trim().match(/^#{1,6}\s/)) {
      const level = line.trim().match(/^#+/)[0].length;
      let fontSize;
      switch(level) {
        case 1: fontSize = "1.25rem"; break;
        case 2: fontSize = "1.15rem"; break;
        case 3: fontSize = "1.1rem"; break;
        default: fontSize = "1rem";
      }
      
      return (
        <div 
          key={index} 
          className="font-bold mb-2 mt-3" 
          style={{fontSize}}
          dangerouslySetInnerHTML={{__html: formattedLine.replace(/^#+\s*/, '')}}
        />
      );
    }
    
    if (line.trim().match(/^[-*•]\s/)) {
      return (
        <div key={index} className="flex ml-4 my-1">
          <span className="mr-2">•</span>
          <span dangerouslySetInnerHTML={{__html: formattedLine.replace(/^[-*•]\s/, '')}} />
        </div>
      );
    }
    
    return (
      <div key={index} className="my-1" dangerouslySetInnerHTML={{__html: formattedLine}} />
    );
  });
};

// React component wrapper for displaying formatted note content
interface NoteContentDisplayProps {
  content: string | null;
}

const NoteContentDisplay: React.FC<NoteContentDisplayProps> = ({ content }) => {
  if (!content) {
    return <div>No content provided.</div>;
  }
  
  return <div className="whitespace-pre-wrap">{formatNoteContent(content)}</div>;
};

export default NoteContentDisplay;
