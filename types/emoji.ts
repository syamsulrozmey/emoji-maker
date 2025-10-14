export interface Folder {
  id: string; // UUID from database
  name: string;
  user_id: string;
  created_at: string; // ISO timestamp from database
}

export interface Emoji {
  id: string;
  imageUrl: string;
  title: string;
  folderId?: string | null;
  isLiked?: boolean;
  likesCount?: number;
  createdAt?: number;
}

export interface GenerateEmojiResponse {
  success: boolean;
  imageUrl: string;
  prompt: string;
}

export interface GenerateEmojiRequest {
  prompt: string;
}

