
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContentAlertProps {
  className?: string;
  message?: string;
}

export function ContentAlert({ className, message }: ContentAlertProps) {
  return (
    <Alert className={cn("mb-4 border-primary/40 bg-primary/10", className)}>
      <Info className="h-4 w-4 text-primary" />
      <AlertDescription className="text-foreground font-medium">
        {message || "Content added here will be available to your project chat assistant."}
      </AlertDescription>
    </Alert>
  )
}
