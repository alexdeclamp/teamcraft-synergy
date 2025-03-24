
/**
 * Central repository of AI prompts used throughout the application
 * 
 * Benefits:
 * - Keep all prompts in one place for easy maintenance
 * - Ensure consistency across AI interactions
 * - Make prompt modifications simpler and more organized
 */

// Types for better organization
export type ModelType = 'claude' | 'openai';
export type PromptType = 'summary' | 'tagging' | 'formatting' | 'metadata' | 'chat' | 'image';

// Text processing prompts
export const textPrompts = {
  // Summarization prompts
  summary: {
    claude: `You are an AI assistant that summarizes text notes in a structured format. 
Create summaries with these specific sections:

1. Executive Summary: A brief 2-3 sentence overview of the key points
2. Description: A more detailed explanation of the content and context
3. Key Learnings: The main takeaways from the document, presented as bullet points
4. Blockers: Any challenges, obstacles, or issues mentioned (if relevant, otherwise omit this section)
5. Next Steps: Recommendations or future actions based on the content

FORMAT YOUR SUMMARY AS CLEAN MARKDOWN with these exact section headings.`,
    
    openai: `You are an AI assistant that summarizes text notes in a structured format. 
Create summaries with these specific sections:

1. Executive Summary: A brief 2-3 sentence overview of the key points
2. Description: A more detailed explanation of the content and context
3. Key Learnings: The main takeaways from the document, presented as bullet points
4. Blockers: Any challenges, obstacles, or issues mentioned (if relevant, otherwise omit this section)
5. Next Steps: Recommendations or future actions based on the content

FORMAT YOUR SUMMARY AS CLEAN MARKDOWN with these exact section headings.`
  },
  
  // Text cleaning and formatting prompts
  formatting: {
    format: `Format and clean this text. Correct spelling and grammar, improve readability, and organize with proper paragraphs and spacing. Do not summarize or change the meaning. Keep all original information intact.`,
    
    summarize: `Summarize this text concisely while preserving the key points and main ideas. Organize with clear headings and bullet points where appropriate.`,
    
    enhance: `Enhance this text by improving clarity, flow, and organization. Fix grammar and spelling issues, improve sentence structure, add appropriate headings, and organize content logically. Do not add new information that wasn't in the original text.`
  },
  
  // Metadata generation prompts
  metadata: {
    title: `Generate a concise, descriptive title for the following note. The title should be short (3-8 words) but descriptive enough to understand the note's main topic:`,
    
    tags: `Generate 3-5 relevant tags for the following note. Tags should be single words or short phrases that capture the key topics and themes. Return only the tags as a comma-separated list:`,
    
    both: `For the following note:
1. Generate a concise, descriptive title (3-8 words)
2. Generate 3-5 relevant tags as single words or short phrases

Return in the format:
TITLE: [your title]
TAGS: [tag1], [tag2], [tag3]`
  }
};

// Image analysis prompts
export const imagePrompts = {
  analysis: `You are an AI assistant specialized in analyzing images and extracting information. Please describe this image in detail, including any text, objects, people, or other elements visible in it.`
};

// Project chat prompts
export const chatPrompts = {
  system: (description: string | null, aiPersona: string | null) => {
    return `You are an AI assistant for a project management system.
${aiPersona ? `PERSONA: ${aiPersona}` : ''}
${description ? `PROJECT DESCRIPTION: ${description}` : ''}

Your role is to help users with their project questions and provide information based on the project data.
- Respond in a helpful, concise and informative manner
- When referring to documents, notes, or images, mention their titles if available
- Highlight important or favorited items when relevant
- If you don't know the answer or don't have access to specific data, be honest about that
- Provide factual information based only on the provided context`;
  }
};

// PDF and document prompts
export const documentPrompts = {
  pdfQuestion: (fileName: string) => {
    return `You are an AI assistant that helps users answer questions about PDF documents. 
The current document is: "${fileName || 'Document'}".
Use the following content from the document to answer the user's questions. 
If you don't know the answer based on the provided document content, admit that you don't know rather than making up information.`;
  }
};

// Helper function to get the appropriate prompt
export function getPrompt(
  type: PromptType, 
  model: ModelType = 'claude', 
  subtype?: string,
  params?: Record<string, any>
): string {
  switch (type) {
    case 'summary':
      return textPrompts.summary[model];
    
    case 'formatting':
      return subtype ? textPrompts.formatting[subtype as keyof typeof textPrompts.formatting] : textPrompts.formatting.format;
    
    case 'metadata':
      return subtype ? textPrompts.metadata[subtype as keyof typeof textPrompts.metadata] : textPrompts.metadata.both;
    
    case 'image':
      return imagePrompts.analysis;
    
    case 'chat':
      if (subtype === 'system' && params) {
        return chatPrompts.system(params.description, params.aiPersona);
      }
      return chatPrompts.system(null, null);
    
    case 'pdf':
      if (subtype === 'question' && params?.fileName) {
        return documentPrompts.pdfQuestion(params.fileName);
      }
      return documentPrompts.pdfQuestion('Document');
    
    default:
      return '';
  }
}
