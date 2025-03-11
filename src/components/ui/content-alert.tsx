
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
          <DropdownMenuItem className="cursor-default">1. Upload your PDF document</DropdownMenuItem>
          <DropdownMenuItem className="cursor-default">2. Click on the document in the list</DropdownMenuItem>
          <DropdownMenuItem className="cursor-default">3. Select "Generate Summary" from the actions menu</DropdownMenuItem>
          <DropdownMenuItem className="cursor-default">4. Review the generated content and save as a note</DropdownMenuItem>
        </>
      );
    } else if (documentType === 'image') {
      return (
        <>
          <DropdownMenuItem className="cursor-default">1. Upload your image</DropdownMenuItem>
          <DropdownMenuItem className="cursor-default">2. Click on the image in the gallery</DropdownMenuItem>
          <DropdownMenuItem className="cursor-default">3. Click "Generate Summary" from the actions</DropdownMenuItem>
          <DropdownMenuItem className="cursor-default">4. Review the generated content and save as a note</DropdownMenuItem>
        </>
      );
    }
    
    return null;
  };

  return (
    <Alert className={cn("mb-4 border-primary/40 bg-primary/10", className)}>
      <Info className="h-4 w-4 text-primary" />
      <div className="flex flex-col w-full">
        <div className="flex justify-between items-center">
          <AlertDescription className="text-foreground font-medium">
            {message || "Content added here will be available to your project chat assistant."}
          </AlertDescription>
          
          {documentType && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  How to
                  {isOpen ? (
                    <ChevronUp className="ml-1 h-3 w-3" />
                  ) : (
                    <ChevronDown className="ml-1 h-3 w-3" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                {renderSteps()}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </Alert>
  )
}
