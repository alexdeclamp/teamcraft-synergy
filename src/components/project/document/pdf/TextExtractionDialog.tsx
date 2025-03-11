
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from 'sonner';
import TextExtractionHeader from './components/TextExtractionHeader';
import TextExtractionContent from './components/TextExtractionContent';
import TextExtractionFooter from './components/TextExtractionFooter';

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
  toggleTextView
}) => {
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

  return (
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
        />
      </DialogContent>
    </Dialog>
  );
};

export default TextExtractionDialog;
