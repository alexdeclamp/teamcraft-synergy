
export interface Update {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  tags?: string[];
  is_favorite?: boolean; // Added is_favorite property to the interface
  is_important?: boolean;
  is_archived?: boolean;
}
