
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

export function ContentAlert({ className }: { className?: string }) {
  return (
    <Alert className={cn("mb-4 border-primary/40 bg-primary/10", className)}>
      <Lightbulb className="h-4 w-4 text-primary" />
      <AlertDescription className="text-foreground font-medium">
        Content added here will be available to your project chat assistant.
      </AlertDescription>
    </Alert>
  )
}
