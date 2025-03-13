import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import NotesDialog from '@/components/notes/NotesDialog';
import TextExtractionHeader from './components/TextExtractionHeader';
import TextExtractionContent from './components/TextExtractionContent';
import TextExtractionFooter from './components/TextExtractionFooter';
import { useNoteCreationFromText } from '@/hooks/useNoteCreationFromText';

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
  
  const handleOpenPdfDirectly = () => {
    window.open(pdfUrl, '_blank');
  };
  
  const handleDownloadText = () => {
    if (!extractedText) return;
    
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
  };

  const handleCreateNote = () => {
    const textToUse = showSummary && summary ? summary : extractedText;
    noteCreation.handleCreateNote(textToUse, showSummary);
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
