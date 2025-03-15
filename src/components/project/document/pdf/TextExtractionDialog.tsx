
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import NotesDialog from '@/components/notes/NotesDialog';
import TextExtractionHeader from './components/TextExtractionHeader';
import TextExtractionContent from './components/TextExtractionContent';
import TextExtractionFooter from './components/TextExtractionFooter';
import { useNoteCreationFromText } from '@/hooks/useNoteCreationFromText';
import { useDocumentQuestionAnswer } from './hooks/useDocumentQuestionAnswer';

interface TextExtractionDialogProps {
  showTextModal: boolean;
  setShowTextModal: (show: boolean) => void;
  isExtracting: boolean;
  extractedText: string;
  extractionError: string | null;
  diagnosisInfo: string | null;
  pdfInfo: { pageCount: number; isEncrypted: boolean; fingerprint: string } | null;
  textLength: number;
  pageCount: number;
  fileName: string;
  pdfUrl: string;
  onRetryExtraction: () => void;
  handleSummarizeText: (model: 'claude' | 'openai') => void;
  isSummarizing: boolean;
  summary: string;
  showSummary: boolean;
  toggleTextView: () => void;
  projectId?: string;
}

const TextExtractionDialog: React.FC<TextExtractionDialogProps> = ({
  showTextModal,
  setShowTextModal,
  isExtracting,
  extractedText,
  extractionError,
  diagnosisInfo,
  pdfInfo,
  textLength,
  pageCount,
  fileName,
  pdfUrl,
  onRetryExtraction,
  isSummarizing,
  summary,
  showSummary,
  toggleTextView,
  projectId
}) => {
  const { user } = useAuth();
  const noteCreation = useNoteCreationFromText({ projectId, fileName, pdfUrl });
  const questionAnswering = useDocumentQuestionAnswer({
    pdfUrl,
    fileName,
    extractedText,
    projectId
  });
  
  const handleOpenPdfDirectly = () => {
    try {
      window.open(pdfUrl, '_blank');
      // Fallback if window.open is blocked
      if (!window.open) {
        toast.info("Opening PDF in a new tab was blocked by your browser", {
          description: "You may need to allow popups for this site.",
          duration: 5000
        });
        
        // Create a clickable link as an alternative
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.click();
      }
    } catch (error) {
      console.error('Error opening PDF directly:', error);
      toast.error("Could not open the PDF directly", {
        description: "Try downloading the PDF first, then opening it with your PDF viewer.",
        action: {
          label: "Copy URL",
          onClick: () => {
            navigator.clipboard.writeText(pdfUrl);
            toast.success("PDF URL copied to clipboard");
          }
        }
      });
    }
  };
  
  const handleDownloadText = () => {
    if (!extractedText && !summary) {
      toast.error("No content available to download");
      return;
    }
    
    try {
      const content = showSummary && summary ? summary : extractedText;
      const fileNameSuffix = showSummary && summary ? '-summary' : '-extracted-text';
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName.replace('.pdf', '')}${fileNameSuffix}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Show a success toast
      const successMessage = `${showSummary ? 'Summary' : 'Text'} downloaded successfully`;
      toast.success(successMessage);
    } catch (error) {
      console.error('Error downloading text:', error);
      toast.error("Failed to download text", {
        description: "There was an error creating the download. Please try again."
      });
    }
  };

  const handleCreateNote = () => {
    try {
      if (!extractedText && !summary) {
        toast.error("Cannot create a note without content");
        return;
      }
      
      const textToUse = showSummary && summary ? summary : extractedText;
      noteCreation.handleCreateNote(textToUse, showSummary);
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error("Failed to create note", {
        description: "An unexpected error occurred. Please try again."
      });
    }
  };

  return (
    <>
      <Dialog open={showTextModal} onOpenChange={setShowTextModal}>
        <DialogContent className="sm:max-w-[750px] max-h-[85vh] flex flex-col">
          <TextExtractionHeader
            fileName={fileName}
            pageCount={pageCount}
            textLength={textLength}
            showSummary={showSummary}
            summary={summary}
            toggleTextView={toggleTextView}
            isSummarizing={isSummarizing}
            diagnosisInfo={diagnosisInfo}
            pdfInfo={pdfInfo}
          />
          
          <TextExtractionContent
            isExtracting={isExtracting}
            isSummarizing={isSummarizing}
            extractionError={extractionError}
            extractedText={extractedText}
            summary={summary}
            showSummary={showSummary}
            onRetryExtraction={onRetryExtraction}
            handleOpenPdfDirectly={handleOpenPdfDirectly}
            currentQuestion={questionAnswering.currentQuestion}
            answer={questionAnswering.answer}
            isAnswering={questionAnswering.isAnswering}
            onAskQuestion={questionAnswering.askQuestion}
          />
          
          <TextExtractionFooter
            isExtracting={isExtracting}
            isSummarizing={isSummarizing}
            extractedText={extractedText}
            showSummary={showSummary}
            handleDownloadText={handleDownloadText}
            handleCreateNote={projectId ? handleCreateNote : undefined}
            projectId={projectId}
          />
        </DialogContent>
      </Dialog>

      <NotesDialog
        isOpen={noteCreation.isNoteDialogOpen}
        onOpenChange={noteCreation.setIsNoteDialogOpen}
        type="create"
        title={noteCreation.noteTitle}
        content={noteCreation.noteContent}
        tagInput={noteCreation.tagInput}
        tags={noteCreation.noteTags}
        saving={noteCreation.saving}
        aiModel={noteCreation.aiModel}
        onTitleChange={noteCreation.setNoteTitle}
        onContentChange={noteCreation.setNoteContent}
        onTagInputChange={noteCreation.setTagInput}
        onTagInputKeyDown={noteCreation.handleTagInputKeyDown}
        addTag={noteCreation.addTag}
        removeTag={noteCreation.removeTag}
        handleSubmit={() => user && noteCreation.handleSubmitNote(user.id)}
        handleRegenerateTitle={noteCreation.handleRegenerateTitle}
        handleRegenerateTags={noteCreation.handleRegenerateTags}
        handleRegenerateBoth={noteCreation.handleRegenerateBoth}
        onModelChange={noteCreation.setAiModel}
      />
    </>
  );
};

export default TextExtractionDialog;
