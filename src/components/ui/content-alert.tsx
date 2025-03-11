
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare } from "lucide-react"

export function ContentAlert() {
  return (
    <Alert className="mb-4">
      <MessageSquare className="h-4 w-4" />
      <AlertDescription>
        Content added here will be available to your project chat assistant.
      </AlertDescription>
    </Alert>
  )
}
