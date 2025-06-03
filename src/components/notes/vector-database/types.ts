
import { Note } from '../types';

export interface VectorStats {
  totalNotes: number;
  embeddedNotes: number;
  embeddingPercentage: number;
  projectBreakdown: Array<{
    projectId: string;
    projectTitle: string;
    totalNotes: number;
    embeddedNotes: number;
    percentage: number;
  }>;
}

export interface NoteWithProject extends Note {
  projects?: {
    title: string;
  };
}

export interface VectorDatabaseDashboardProps {
  projectId?: string;
}
