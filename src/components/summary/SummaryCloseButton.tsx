
import React from 'react';
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { X } from 'lucide-react';

const SummaryCloseButton: React.FC = () => {
  return (
    <DialogClose asChild>
      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Button>
    </DialogClose>
  );
};

export default SummaryCloseButton;
