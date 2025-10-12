'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { PromptInput } from '@/components/prompt-input';
import { FilterTabs } from '@/components/filter-tabs';
import { EmojiGrid } from '@/components/emoji-grid';
import { AddFolderDialog } from '@/components/add-folder-dialog';
import { FolderModal } from '@/components/folder-modal';
import { ImageLightboxModal } from '@/components/image-lightbox-modal';
import { Emoji, Folder } from '@/types/emoji';

export default function Home() {
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [credits, setCredits] = useState(5);
  const [isAddFolderDialogOpen, setIsAddFolderDialogOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [selectedEmojiId, setSelectedEmojiId] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxEmojiId, setLightboxEmojiId] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedEmojis = localStorage.getItem('emojis');
    const savedFolders = localStorage.getItem('folders');
    
    if (savedEmojis) {
      try {
        const parsed = JSON.parse(savedEmojis);
        // Migrate old emoji data from category to folderId
        const migrated = parsed.map((emoji: any) => ({
          ...emoji,
          folderId: emoji.folderId !== undefined ? emoji.folderId : null,
        }));
        setEmojis(migrated);
      } catch (error) {
        console.error('Error loading emojis:', error);
      }
    }
    
    if (savedFolders) {
      try {
        setFolders(JSON.parse(savedFolders));
      } catch (error) {
        console.error('Error loading folders:', error);
      }
    }
  }, []);

  // Save emojis to localStorage
  useEffect(() => {
    if (emojis.length > 0) {
      localStorage.setItem('emojis', JSON.stringify(emojis));
    }
  }, [emojis]);

  // Save folders to localStorage
  useEffect(() => {
    localStorage.setItem('folders', JSON.stringify(folders));
  }, [folders]);

  const handleGenerate = async (prompt: string) => {
    if (credits <= 0) {
      alert('You have no credits left. Please upgrade to continue.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate emoji');
      }

      const data = await response.json();
      
      const newEmoji: Emoji = {
        id: Date.now().toString(),
        imageUrl: data.imageUrl,
        title: prompt,
        folderId: null,
        isLiked: false,
        createdAt: Date.now(),
      };

      setEmojis((prev) => [newEmoji, ...prev]);
      setCredits((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error generating emoji:', error);
      alert('Failed to generate emoji. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = (id: string) => {
    setEmojis((prev) =>
      prev.map((emoji) =>
        emoji.id === id ? { ...emoji, isLiked: !emoji.isLiked } : emoji
      )
    );
  };

  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      createdAt: Date.now(),
    };
    setFolders((prev) => [...prev, newFolder]);
  };

  const handleRenameFolder = (id: string, newName: string) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === id ? { ...folder, name: newName } : folder
      )
    );
  };

  const handleDeleteFolder = (id: string) => {
    // Remove folder
    setFolders((prev) => prev.filter((folder) => folder.id !== id));
    
    // Move emojis from this folder to "All" (set folderId to null)
    setEmojis((prev) =>
      prev.map((emoji) =>
        emoji.folderId === id ? { ...emoji, folderId: null } : emoji
      )
    );
  };

  const handleOpenFolderModal = (emojiId: string) => {
    setSelectedEmojiId(emojiId);
    setIsFolderModalOpen(true);
  };

  const handleAssignEmojiToFolder = (folderId: string | null, newFolderName?: string) => {
    if (!selectedEmojiId) return;

    // If creating a new folder
    if (newFolderName) {
      const newFolder: Folder = {
        id: Date.now().toString(),
        name: newFolderName,
        createdAt: Date.now(),
      };
      setFolders((prev) => [...prev, newFolder]);
      
      // Assign emoji to the new folder
      setEmojis((prev) =>
        prev.map((emoji) =>
          emoji.id === selectedEmojiId ? { ...emoji, folderId: newFolder.id } : emoji
        )
      );
    } else {
      // Assign to existing folder or remove from folder (folderId = null)
      setEmojis((prev) =>
        prev.map((emoji) =>
          emoji.id === selectedEmojiId ? { ...emoji, folderId } : emoji
        )
      );
    }
    
    setSelectedEmojiId(null);
  };

  const handleImageClick = (emojiId: string) => {
    setLightboxEmojiId(emojiId);
    setLightboxOpen(true);
  };

  const handleLightboxClose = () => {
    setLightboxOpen(false);
    setLightboxEmojiId(null);
  };

  const handleDeleteFromLightbox = (emojiId: string) => {
    setEmojis((prev) => prev.filter((e) => e.id !== emojiId));
    handleLightboxClose();
  };

  const filteredEmojis = emojis.filter((emoji) => {
    if (activeTab === 'All') return true;
    return emoji.folderId === activeTab;
  });

  const selectedEmoji = emojis.find((e) => e.id === selectedEmojiId);

  return (
    <div className="min-h-screen bg-white">
      <Header credits={credits} />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-16">
          <PromptInput onGenerate={handleGenerate} isLoading={isLoading} />
        </div>

        <div className="space-y-8">
          <FilterTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            folders={folders}
            onCreateFolder={() => setIsAddFolderDialogOpen(true)}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
          />
          
          <div>
            <h2 className="text-3xl font-bold mb-8">
              Emoji you have generated so far
            </h2>
            <EmojiGrid
              emojis={filteredEmojis}
              onLike={handleLike}
              onAssignFolder={handleOpenFolderModal}
              onImageClick={handleImageClick}
            />
          </div>
        </div>
      </main>

      <AddFolderDialog
        isOpen={isAddFolderDialogOpen}
        onClose={() => setIsAddFolderDialogOpen(false)}
        onCreateFolder={handleCreateFolder}
        existingFolderNames={folders.map((f) => f.name)}
      />

      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={() => {
          setIsFolderModalOpen(false);
          setSelectedEmojiId(null);
        }}
        onSave={handleAssignEmojiToFolder}
        currentFolderId={selectedEmoji?.folderId}
        folders={folders}
      />

      {lightboxOpen && lightboxEmojiId && (
        <ImageLightboxModal
          isOpen={lightboxOpen}
          onClose={handleLightboxClose}
          emojis={filteredEmojis}
          currentEmojiId={lightboxEmojiId}
          onDelete={handleDeleteFromLightbox}
          onLike={handleLike}
          folders={folders}
        />
      )}
    </div>
  );
}
