
import { toast } from 'sonner';

export function useNoteRegeneration() {
  const handleRegenerateTitle = (newTitle: string, setTitle: (title: string) => void) => {
    setTitle(newTitle);
    toast.success('Title regenerated successfully');
  };

  const handleRegenerateTags = (newTags: string[], setTags: (tags: string[]) => void) => {
    setTags(newTags);
    toast.success('Tags regenerated successfully');
  };

  const handleRegenerateBoth = (
    data: { title: string; tags: string[] },
    setTitle: (title: string) => void,
    setTags: (tags: string[]) => void
  ) => {
    setTitle(data.title);
    setTags(data.tags);
    toast.success('Title and tags regenerated successfully');
  };

  return {
    handleRegenerateTitle,
    handleRegenerateTags,
    handleRegenerateBoth
  };
}
