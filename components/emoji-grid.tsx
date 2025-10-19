'use client';

import { EmojiCard } from './emoji-card';
import { Emoji } from '@/types/emoji';

interface EmojiGridProps {
  emojis: Emoji[];
  onLike: (id: string) => void;
  onAssignFolder: (id: string) => void;
  onImageClick: (id: string) => void;
}

export function EmojiGrid({ emojis, onLike, onAssignFolder, onImageClick }: EmojiGridProps) {
  if (emojis.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No emojis generated yet. Start creating your first emoji!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-[16px] pb-[16px]">
      {emojis.map((emoji) => (
        <EmojiCard
          key={emoji.id}
          imageUrl={emoji.imageUrl}
          title={emoji.title}
          onLike={() => onLike(emoji.id)}
          isLiked={emoji.isLiked}
          onAssignFolder={() => onAssignFolder(emoji.id)}
          folderId={emoji.folderId}
          onImageClick={() => onImageClick(emoji.id)}
        />
      ))}
    </div>
  );
}

