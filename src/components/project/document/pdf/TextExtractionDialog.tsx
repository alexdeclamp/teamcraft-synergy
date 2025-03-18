
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TextExtractionHeader from './components/TextExtractionHeader';
import TextExtractionContent from './components/TextExtractionContent';
import TextExtractionBanner from './components/TextExtractionBanner';
import TextExtractionFooter from './components/TextExtractionFooter';
import { Loader2, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBig4Summary } from '@/hooks/useBig4Summary';
import Big4SummaryView from './components/Big4SummaryView';

interface TextExtractionDialogProps {
  showTextModal: boolean;
  setShowTextModal: (show: boolean) => void;
  isExtracting: boolean;
  extractedText: string;
  extractionError: string | null;
  diagnosisInfo: string | null;
  pdfInfo: {pageCount: number; isEncrypted: boolean; fingerprint: string} | null;
  textLength: number;
  pageCount: number;
  fileName: string;
  pdfUrl: string;
  onRetryExtraction: () => void;
  handleSummarizeText: (model?: 'claude' | 'openai') => void;
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
  const [activeTab, setActiveTab] = useState<string>("text");
  
  const {
    isGenerating: isGeneratingBig4,
    big4Summary,
    generateBig4Summary
  } = useBig4Summary({
    pdfContent: extractedText,
    pdfSummary: summary,
    fileName,
    model: 'claude'
  });

  const handleGenerateBig4Summary = async () => {
    await generateBig4Summary();
    setActiveTab("big4");
  };

  return (
    <Dialog open={showTextModal} onOpenChange={setShowTextModal}>
      <DialogContent className="sm:max-w-[800px] md:max-w-[900px] lg:max-w-[1000px] w-[calc(100vw-32px)] max-h-[calc(100vh-64px)] flex flex-col overflow-hidden">
        <TextExtractionHeader 
          pdfInfo={pdfInfo}
          textLength={textLength}
          pageCount={pageCount}
          fileName={fileName}
          setShowTextModal={setShowTextModal}
        />

        {(isExtracting || extractionError) ? (
          <TextExtractionBanner 
            isExtracting={isExtracting}
            extractionError={extractionError}
            diagnosisInfo={diagnosisInfo}
            onRetryExtraction={onRetryExtraction}
          />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-1">
              <TabsList>
                <TabsTrigger value="text">
                  {showSummary ? "Summary" : "Full Text"}
                </TabsTrigger>
                <TabsTrigger value="big4" disabled={!big4Summary && !isGeneratingBig4}>
                  Big 4 Summary
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                {!summary && !showSummary && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={isSummarizing || !extractedText || extractedText.length === 0}
                    onClick={() => handleSummarizeText()}
                    className="flex items-center gap-1"
                  >
                    {isSummarizing ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Summarizing...</span>
                      </>
                    ) : (
                      <>
                        <FileQuestion className="h-3 w-3" />
                        <span>Summarize</span>
                      </>
                    )}
                  </Button>
                )}
                
                {summary && !big4Summary && !isGeneratingBig4 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={isGeneratingBig4}
                    onClick={handleGenerateBig4Summary}
                    className="flex items-center gap-1"
                  >
                    {isGeneratingBig4 ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <span>Create Big 4 Summary</span>
                    )}
                  </Button>
                )}
                
                {summary && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={toggleTextView}
                  >
                    Switch to {showSummary ? "Full Text" : "Summary"}
                  </Button>
                )}
              </div>
            </div>
            
            <TabsContent value="text" className="flex-1 overflow-auto mt-0 p-0 border-0">
              <TextExtractionContent 
                isExtracting={isExtracting}
                extractedText={extractedText}
                summary={summary}
                showSummary={showSummary}
              />
            </TabsContent>
            
            <TabsContent value="big4" className="flex-1 overflow-auto mt-0 p-4 border-0">
              <Big4SummaryView 
                summary={big4Summary!}
                fileName={fileName}
                pdfUrl={pdfUrl}
                projectId={projectId}
                isGenerating={isGeneratingBig4}
              />
            </TabsContent>
          </Tabs>
        )}
        
        <TextExtractionFooter 
          extractedText={extractedText}
          summary={summary}
          showSummary={showSummary}
          fileName={fileName}
          pdfUrl={pdfUrl}
          projectId={projectId}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TextExtractionDialog;
