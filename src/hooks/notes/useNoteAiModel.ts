
import { useState } from 'react';

export function useNoteAiModel() {
  const [aiModel, setAiModel] = useState<'claude' | 'openai'>('claude');

  return {
    aiModel,
    setAiModel
  };
}
