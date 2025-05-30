
import React from 'react';

export const formatNoteContent = (text: string) => {
  if (!text) return "No content provided.";
  
  // Pre-process the text to fix common formatting issues
  text = text
    // Ensure consistent line breaks
    .replace(/\r\n/g, '\n')
    // Fix inconsistent spacing around headings but preserve the heading line intact
    .replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2')
    // Ensure proper spacing after headings without affecting the heading content
    .replace(/(^#{1,6}\s.*?)(\n(?!\n))/gm, '$1\n')
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
    
    // Check if the line is a heading and process it as a complete unit
    if (line.match(/^#{1,6}\s/)) {
      const level = line.match(/^#+/)[0].length;
      let fontSize;
      let className = "font-bold mb-3 mt-5 text-slate-800 break-words hyphens-auto overflow-hidden";
      
      switch(level) {
        case 1: fontSize = "1.4rem"; break;
        case 2: fontSize = "1.25rem"; break;
        case 3: fontSize = "1.15rem"; break;
        default: fontSize = "1.05rem";
      }
      
      // Get everything after the #s and initial space as a single unit
      const headingContent = line.replace(/^#{1,6}\s/, '');
      
      // Process text formatting within the heading
      const formattedHeadingContent = headingContent
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/__(.*?)__/g, '<u>$1</u>');
      
      return (
        <div 
          key={`heading-${index}`} 
          className={className}
          style={{fontSize, overflowWrap: 'break-word', wordWrap: 'break-word'}}
          dangerouslySetInnerHTML={{__html: formattedHeadingContent}}
        />
      );
    }
    
    // Process text formatting (bold, italic, underline)
    let formattedLine = line
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>');
    
    // Handle bullet points (all types of list markers)
    if (line.trim().match(/^[•*-]\s/)) {
      // Extract the content after the list marker
      const listContent = formattedLine.replace(/^[•*-]\s/, '');
      
      return (
        <div key={`bullet-${index}`} className="flex ml-4 my-2">
          <span className="mr-2 text-primary flex-shrink-0">•</span>
          <span className="break-words overflow-hidden overflow-wrap-anywhere hyphens-auto" style={{overflowWrap: 'break-word', wordWrap: 'break-word'}} dangerouslySetInnerHTML={{__html: listContent}} />
        </div>
      );
    }
    
    // Regular paragraph with improved spacing
    return (
      <div 
        key={`para-${index}`} 
        className="my-2 text-slate-700 leading-relaxed break-words overflow-hidden hyphens-auto" 
        style={{overflowWrap: 'break-word', wordWrap: 'break-word'}}
        dangerouslySetInnerHTML={{__html: formattedLine}} 
      />
    );
  });
};

interface NotesFormatterProps {
  content: string | null;
}

const NotesFormatter: React.FC<NotesFormatterProps> = ({ content }) => {
  if (!content) {
    return <div className="text-muted-foreground italic">No content provided.</div>;
  }
  
  return (
    <div className="whitespace-pre-wrap prose-sm max-w-none leading-relaxed break-words hyphens-auto overflow-hidden" style={{overflowWrap: 'break-word', wordWrap: 'break-word'}}>
      {formatNoteContent(content)}
    </div>
  );
};

export default NotesFormatter;
