export interface Folder {
  id: string;
  name: string;
  createdAt: number;
}

export interface Emoji {
  id: string;
  imageUrl: string;
  title: string;
  folderId?: string | null;
  isLiked?: boolean;
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

