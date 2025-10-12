'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Download, Heart, Folder } from 'lucide-react';
import { Button } from './ui/button';

interface EmojiCardProps {
  imageUrl: string;
  title: string;
  onLike?: () => void;
  isLiked?: boolean;
  onAssignFolder?: () => void;
  folderId?: string | null;
  onImageClick?: () => void;
}

export function EmojiCard({ 
  imageUrl, 
  title, 
  onLike, 
  isLiked = false,
  onAssignFolder,
  folderId,
  onImageClick,
}: EmojiCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onImageClick}
      >
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          unoptimized
        />
        {isHovered && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 transition-all duration-200">
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-full bg-white hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
            >
              <Download className="h-5 w-5 text-gray-900" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-full bg-white hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                onLike?.();
              }}
            >
              <Heart
                className={`h-5 w-5 ${
                  isLiked ? 'fill-red-500 text-red-500' : 'text-gray-900'
                }`}
              />
            </Button>
            {onAssignFolder && (
              <Button
                variant="secondary"
                size="icon"
                className="h-10 w-10 rounded-full bg-white hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onAssignFolder();
                }}
              >
                <Folder
                  className={`h-5 w-5 ${
                    folderId ? 'fill-blue-500 text-blue-500' : 'text-gray-900'
                  }`}
                />
              </Button>
            )}
          </div>
        )}
        {folderId && !isHovered && (
          <div className="absolute top-2 right-2">
            <div className="bg-blue-500 rounded-full p-1.5">
              <Folder className="h-3 w-3 text-white fill-white" />
            </div>
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-900 truncate">{title}</h3>
    </div>
  );
}

