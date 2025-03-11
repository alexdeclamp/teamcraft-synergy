
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2 } from 'lucide-react';

interface ImageSummaryButtonUIProps {
  onClick: () => void;
  isGenerating: boolean;
  hasSummary: boolean;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const ImageSummaryButtonUI: React.FC<ImageSummaryButtonUIProps> = ({
  onClick,
  isGenerating,
  hasSummary,
  disabled = false,
  className = "",
  variant = "outline",
  size = "sm"
}) => {
  return (
    <Button 
      variant={variant} 
      size={size}
      className={`text-xs px-2 py-1 h-7 flex items-center gap-1.5 ${hasSummary ? 'text-green-500 border-green-200 bg-green-50' : ''} ${className}`}
      onClick={onClick}
      disabled={isGenerating || disabled}
      title={hasSummary ? "View AI Summary" : "Generate AI Summary"}
    >
      {isGenerating ? 
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 
        <MessageSquare className="h-3.5 w-3.5" />
      }
      <span>{hasSummary ? "View Summary" : "AI Summary"}</span>
    </Button>
  );
};

export default ImageSummaryButtonUI;
