export interface Emoji {
  id: string;
  imageUrl: string;
  title: string;
  category?: string;
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

