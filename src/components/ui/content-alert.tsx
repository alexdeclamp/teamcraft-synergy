
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface ContentAlertProps {
  className?: string;
  message?: string;
  documentType?: 'pdf' | 'image';
}

export function ContentAlert({ className, message, documentType }: ContentAlertProps) {
  const [isOpen, setIsOpen] = useState(false);

  const renderSteps = () => {
    if (documentType === 'pdf') {
      return (
        <>
          <DropdownMenuItem className="cursor-default flex items-center py-3 px-4">
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-sm mr-3">1</span>
            Upload your PDF document
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-default flex items-center py-3 px-4">
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-sm mr-3">2</span>
            Click on the document in the list
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-default flex items-center py-3 px-4">
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-sm mr-3">3</span>
            Select "Generate Summary" from the actions menu
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-default flex items-center py-3 px-4">
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-sm mr-3">4</span>
            Review the generated content and save as a note
          </DropdownMenuItem>
        </>
      );
    } else if (documentType === 'image') {
      return (
        <>
          <DropdownMenuItem className="cursor-default flex items-center py-3 px-4">
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-sm mr-3">1</span>
            Upload your image
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-default flex items-center py-3 px-4">
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-sm mr-3">2</span>
            Click on the image in the gallery
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-default flex items-center py-3 px-4">
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-sm mr-3">3</span>
            Click "Generate Summary" from the actions
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-default flex items-center py-3 px-4">
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-sm mr-3">4</span>
            Review the generated content and save as a note
          </DropdownMenuItem>
        </>
      );
    }
    
    return null;
  };

  return (
    <Alert className={cn("mb-4 border-primary/40 bg-primary/10 shadow-sm", className)}>
      <Info className="h-5 w-5 text-primary" />
      <div className="flex flex-col w-full">
        <div className="flex justify-between items-center gap-4">
          <AlertDescription className="text-foreground font-medium py-1">
            {message || "Content added here will be available to your project chat assistant."}
          </AlertDescription>
          
          {documentType && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline"
                  size="sm" 
                  className="h-8 px-3 text-sm border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/40"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  How to
                  {isOpen ? (
                    <ChevronUp className="ml-1.5 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1.5 h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-[360px] bg-white/95 backdrop-blur-sm border-primary/20 shadow-lg"
              >
                {renderSteps()}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </Alert>
  )
}
