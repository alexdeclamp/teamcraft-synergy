
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Save } from 'lucide-react';
import { Big4Summary } from '@/hooks/useBig4Summary';
import { useNoteCreationFromText } from '@/hooks/useNoteCreationFromText';
import { useAuth } from '@/contexts/AuthContext';

interface Big4SummaryViewProps {
  summary: Big4Summary;
  fileName: string;
  pdfUrl: string;
  projectId?: string;
  isGenerating: boolean;
}

const Big4SummaryView: React.FC<Big4SummaryViewProps> = ({
  summary,
  fileName,
  pdfUrl,
  projectId,
  isGenerating
}) => {
  const { user } = useAuth();
  const {
    handleCreateNote,
    handleSubmitNote,
    isNoteDialogOpen,
    setIsNoteDialogOpen,
    noteTitle,
    noteContent
  } = useNoteCreationFromText({
    projectId,
    fileName,
    pdfUrl
  });

  const handleSaveAsNote = () => {
    if (!summary) return;
    
    // Format the summary as Markdown
    const formattedContent = `
# Executive Summary
${summary.executiveSummary}

# Description
${summary.description}

# Key Learnings
${summary.keyLearnings.map(item => `* ${item}`).join('\n')}

# Blockers
${summary.blockers && summary.blockers.length > 0 
  ? summary.blockers.map(item => `* ${item}`).join('\n') 
  : '* None identified'}

# Next Steps
${summary.nextSteps.map(item => `* ${item}`).join('\n')}
`;

    handleCreateNote(formattedContent, false);
  };

  const handleDownload = () => {
    if (!summary) return;
    
    // Format the summary as Markdown
    const formattedContent = `
# Big 4 Summary: ${fileName}

## Executive Summary
${summary.executiveSummary}

## Description
${summary.description}

## Key Learnings
${summary.keyLearnings.map(item => `* ${item}`).join('\n')}

## Blockers
${summary.blockers && summary.blockers.length > 0 
  ? summary.blockers.map(item => `* ${item}`).join('\n') 
  : '* None identified'}

## Next Steps
${summary.nextSteps.map(item => `* ${item}`).join('\n')}
`;

    const blob = new Blob([formattedContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Big4Summary-${fileName.replace('.pdf', '')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  React.useEffect(() => {
    if (isNoteDialogOpen && user) {
      handleSubmitNote(user.id);
    }
  }, [isNoteDialogOpen, noteTitle, noteContent, user]);

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-center text-muted-foreground">Generating Big 4 Summary...</p>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Big 4 Summary</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload} className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>Download</span>
          </Button>
          <Button variant="default" size="sm" onClick={handleSaveAsNote} className="flex items-center gap-1">
            <Save className="h-4 w-4" />
            <span>Save as Note</span>
          </Button>
        </div>
      </div>

      <div className="space-y-4 bg-gray-50 p-4 rounded-md">
        <div>
          <h3 className="font-semibold text-lg mb-2">Executive Summary</h3>
          <p className="text-gray-700">{summary.executiveSummary}</p>
        </div>
        
        <div>
          <h3 className="font-semibold text-lg mb-2">Description</h3>
          <p className="text-gray-700">{summary.description}</p>
        </div>
        
        <div>
          <h3 className="font-semibold text-lg mb-2">Key Learnings</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            {summary.keyLearnings.map((learning, index) => (
              <li key={`learning-${index}`}>{learning}</li>
            ))}
          </ul>
        </div>
        
        {summary.blockers && summary.blockers.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-2">Blockers</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              {summary.blockers.map((blocker, index) => (
                <li key={`blocker-${index}`}>{blocker}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div>
          <h3 className="font-semibold text-lg mb-2">Next Steps</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            {summary.nextSteps.map((step, index) => (
              <li key={`step-${index}`}>{step}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Big4SummaryView;
