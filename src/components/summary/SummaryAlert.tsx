
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

interface SummaryAlertProps {
  hasSummary: boolean;
  localHasSavedVersion: boolean;
  projectId?: string;
}

const SummaryAlert: React.FC<SummaryAlertProps> = ({
  hasSummary,
  localHasSavedVersion,
  projectId
}) => {
  if (!localHasSavedVersion && hasSummary && projectId) {
    return (
      <Alert variant="default" className="mt-4 bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription>
          <strong>Important:</strong> Click "Save as Note" to add this summary to your project's Brain. This allows your AI to learn from this document.
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
};

export default SummaryAlert;
