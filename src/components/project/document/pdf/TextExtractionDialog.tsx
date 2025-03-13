import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import TextExtractionHeader from './components/TextExtractionHeader';
import TextExtractionContent from './components/TextExtractionContent';
import TextExtractionFooter from './components/TextExtractionFooter';
import NotesDialog from '@/components/notes/NotesDialog';

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
  handleSummarizeText,
  isSummarizing,
  summary,
  showSummary,
  toggleTextView,
  projectId
}) => {
  const { user } = useAuth();
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiModel, setAiModel] = useState<'claude' | 'openai'>('claude');
  
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
    
    toast.success(`${showSummary ? 'Summary' : 'Text'} downloaded successfully`);
  };

  const handleCreateNote = () => {
    const cleanFileName = fileName.replace('.pdf', '');
    const defaultTitle = showSummary ? `Summary of ${cleanFileName}` : `Notes from ${cleanFileName}`;
    
    const defaultContent = showSummary && summary 
      ? summary 
      : extractedText;
    
    const defaultTags = ['pdf', 'document'];
    if (showSummary) defaultTags.push('summary');
    
    setNoteTitle(defaultTitle);
    setNoteContent(defaultContent);
    setNoteTags(defaultTags);
    setIsNoteDialogOpen(true);
  };

  const handleSubmitNote = async () => {
    if (!noteTitle.trim() || !projectId || !user) {
      toast.error('Please enter a title for your note');
      return;
    }
    
    try {
      setSaving(true);
      
      const sourceDocument = {
        type: 'pdf',
        url: pdfUrl,
        name: fileName
      };
      
      const { data, error } = await supabase
        .from('project_notes')
        .insert({
          title: noteTitle,
          content: noteContent,
          project_id: projectId,
          user_id: user.id,
          tags: noteTags.length > 0 ? noteTags : null,
          source_document: sourceDocument
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success('Note created successfully');
      setIsNoteDialogOpen(false);
      
    } catch (error: any) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !noteTags.includes(tagInput.trim())) {
      setNoteTags([...noteTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setNoteTags(noteTags.filter(t => t !== tag));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const handleRegenerateTitle = () => {
    toast.info('Title regeneration not implemented');
  };

  const handleRegenerateTags = () => {
    toast.info('Tags regeneration not implemented');
  };

  const handleRegenerateBoth = () => {
    toast.info('Metadata regeneration not implemented');
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
            handleSummarizeText={handleSummarizeText}
            handleCreateNote={projectId ? handleCreateNote : undefined}
            projectId={projectId}
          />
        </DialogContent>
      </Dialog>

      <NotesDialog
        isOpen={isNoteDialogOpen}
        onOpenChange={setIsNoteDialogOpen}
        type="create"
        title={noteTitle}
        content={noteContent}
        tagInput={tagInput}
        tags={noteTags}
        saving={saving}
        aiModel={aiModel}
        onTitleChange={setNoteTitle}
        onContentChange={setNoteContent}
        onTagInputChange={setTagInput}
        onTagInputKeyDown={handleTagInputKeyDown}
        addTag={addTag}
        removeTag={removeTag}
        handleSubmit={handleSubmitNote}
        handleRegenerateTitle={handleRegenerateTitle}
        handleRegenerateTags={handleRegenerateTags}
        handleRegenerateBoth={handleRegenerateBoth}
        onModelChange={setAiModel}
      />
    </>
  );
};

export default TextExtractionDialog;
