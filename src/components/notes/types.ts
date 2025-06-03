
export interface Note {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  project_id: string;
  creator_name?: string;
  creator_avatar?: string;
  tags?: string[];
  embedding?: number[] | null;
  source_document?: {
    type: 'pdf' | 'image';
    url: string;
    name: string;
  } | null;
}
