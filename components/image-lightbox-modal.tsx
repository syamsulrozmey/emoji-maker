'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Trash2, Download, Heart, Folder as FolderIcon } from 'lucide-react';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Emoji, Folder } from '@/types/emoji';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  emojis: Emoji[];
  currentEmojiId: string;
  onDelete: (id: string) => void;
  onLike?: (id: string) => void;
  folders: Folder[];
}

export function ImageLightboxModal({
  isOpen,
  onClose,
  emojis,
  currentEmojiId,
  onDelete,
  onLike,
  folders,
}: ImageLightboxModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Update current index when emoji ID changes
  useEffect(() => {
    const index = emojis.findIndex((e) => e.id === currentEmojiId);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [currentEmojiId, emojis]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, emojis.length]);

  if (!isOpen || emojis.length === 0) return null;

  const currentEmoji = emojis[currentIndex];
  if (!currentEmoji) return null;

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === emojis.length - 1;

  const goToNext = () => {
    if (!isLast) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (!isFirst) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(currentEmoji.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentEmoji.title.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(currentEmoji.id);
    setDeleteDialogOpen(false);
  };

  const currentFolder = currentEmoji.folderId
    ? folders.find((f) => f.id === currentEmoji.folderId)
    : null;

  return (
    <>
      {/* Main Lightbox */}
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
        {/* Backdrop - click to close */}
        <div
          className="absolute inset-0"
          onClick={onClose}
          aria-label="Close lightbox"
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Close"
        >
          <X className="h-6 w-6 text-white" />
        </button>

        {/* Image counter */}
        <div className="absolute top-4 right-20 z-10 text-white text-sm font-medium bg-black/30 px-3 py-2 rounded-lg">
          {currentIndex + 1} / {emojis.length}
        </div>

        {/* Previous button */}
        {emojis.length > 1 && (
          <button
            onClick={goToPrevious}
            disabled={isFirst}
            className={`absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors ${
              isFirst ? 'opacity-30 cursor-not-allowed' : ''
            }`}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-8 w-8 text-white" />
          </button>
        )}

        {/* Next button */}
        {emojis.length > 1 && (
          <button
            onClick={goToNext}
            disabled={isLast}
            className={`absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors ${
              isLast ? 'opacity-30 cursor-not-allowed' : ''
            }`}
            aria-label="Next image"
          >
            <ChevronRight className="h-8 w-8 text-white" />
          </button>
        )}

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-6 max-w-[90vw] max-h-[90vh] p-4">
          {/* Image */}
          <div className="relative max-h-[70vh] max-w-[80vw]">
            <Image
              src={currentEmoji.imageUrl}
              alt={currentEmoji.title}
              width={800}
              height={800}
              className="object-contain max-h-[70vh] w-auto h-auto"
              unoptimized
              priority
            />
          </div>

          {/* Info */}
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-white text-2xl font-semibold text-center">
              {currentEmoji.title}
            </h2>
            {currentFolder && (
              <div className="flex items-center gap-2 text-white/80 text-sm bg-white/10 px-3 py-1 rounded-full">
                <FolderIcon className="h-4 w-4" />
                <span>{currentFolder.name}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleDownload}
              variant="secondary"
              size="sm"
              className="bg-white/90 hover:bg-white text-gray-900"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>

            {onLike && (
              <Button
                onClick={() => onLike(currentEmoji.id)}
                variant="secondary"
                size="sm"
                className="bg-white/90 hover:bg-white text-gray-900"
              >
                <Heart
                  className={`h-4 w-4 mr-2 ${
                    currentEmoji.isLiked ? 'fill-red-500 text-red-500' : ''
                  }`}
                />
                {currentEmoji.isLiked ? 'Liked' : 'Like'}
              </Button>
            )}

            <Button
              onClick={handleDeleteClick}
              variant="destructive"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Emoji</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{currentEmoji.title}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

