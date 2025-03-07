
import React from 'react';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SummaryDialogHeaderProps {
  title: string;
  hasSavedVersion: boolean;
  isLoading: boolean;
}

const SummaryDialogHeader: React.FC<SummaryDialogHeaderProps> = ({
  title,
  hasSavedVersion,
  isLoading
}) => {
  return (
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>
        {hasSavedVersion && !isLoading 
          ? 'AI-generated summary is saved and available instantly.'
          : 'AI-generated summary to help you remember key elements and learnings.'}
      </DialogDescription>
    </DialogHeader>
  );
};

export default SummaryDialogHeader;
