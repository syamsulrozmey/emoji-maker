'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Header } from '@/components/header';
import { PromptInput } from '@/components/prompt-input';
import { FilterTabs } from '@/components/filter-tabs';
import { EmojiGrid } from '@/components/emoji-grid';
import { AddFolderDialog } from '@/components/add-folder-dialog';
import { FolderModal } from '@/components/folder-modal';
import { ImageLightboxModal } from '@/components/image-lightbox-modal';
import { UpgradeModal } from '@/components/upgrade-modal';
import { Emoji, Folder } from '@/types/emoji';

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [credits, setCredits] = useState(0);
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const [isAddFolderDialogOpen, setIsAddFolderDialogOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [selectedEmojiId, setSelectedEmojiId] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxEmojiId, setLightboxEmojiId] = useState<string | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Fetch emojis from Supabase database
  const fetchEmojis = useCallback(async () => {
    try {
      const response = await fetch('/api/emojis');
      const data = await response.json();
      
      if (data.success && data.emojis) {
        // Transform database format to frontend format
        const transformedEmojis: Emoji[] = data.emojis.map((emoji: {
          id: number;
          image_url: string;
          prompt: string;
          created_at: string;
          likes_count: number;
          isLiked: boolean;
          folder_id: string | null;
        }) => ({
          id: emoji.id.toString(),
          imageUrl: emoji.image_url,
          title: emoji.prompt,
          folderId: emoji.folder_id, // now fetched from database
          isLiked: emoji.isLiked,
          likesCount: emoji.likes_count,
          createdAt: new Date(emoji.created_at).getTime(),
        }));
        
        setEmojis(transformedEmojis);
      }
    } catch (error) {
      console.error('Error fetching emojis:', error);
    }
  }, []);

  // Fetch folders from Supabase database
  const fetchFolders = useCallback(async () => {
    try {
      const response = await fetch('/api/folders');
      const data = await response.json();
      
      if (data.success && data.folders) {
        setFolders(data.folders);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  }, []);

  // Fetch user's current credits from Supabase
  const fetchCredits = useCallback(async () => {
    try {
      const response = await fetch('/api/profile/credits');
      const data = await response.json();
      
      if (data.success && typeof data.credits === 'number') {
        setCredits(data.credits);
        setCurrentTier(data.tier || null);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  }, []);

  // Handle successful payment return with credit polling
  const handlePaymentSuccess = useCallback(async () => {
    // Remove success param from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('success');
    window.history.replaceState({}, '', url.pathname + url.search);
    
    // Show loading state
    setIsLoading(true);
    
    // Poll for credit updates (webhook might still be processing)
    let attempts = 0;
    const maxAttempts = 10;
    const pollInterval = 1000; // 1 second
    let creditsDetected = false;
    
    const pollCredits = async () => {
      const response = await fetch('/api/profile/credits');
      const data = await response.json();
      
      if (data.success && typeof data.credits === 'number') {
        setCredits(data.credits);
        setCurrentTier(data.tier || null);
        
        // Close upgrade modal and stop polling if credits are detected
        if (data.credits > 0) {
          creditsDetected = true;
          setIsUpgradeModalOpen(false);
          setIsLoading(false);
          // Also load emojis and folders
          fetchEmojis();
          fetchFolders();
          return;
        }
      }
      
      attempts++;
      
      if (attempts < maxAttempts && !creditsDetected) {
        setTimeout(pollCredits, pollInterval);
      } else if (!creditsDetected) {
        setIsLoading(false);
        // Also load emojis and folders
        fetchEmojis();
        fetchFolders();
      }
    };
    
    await pollCredits();
  }, [fetchEmojis, fetchFolders]);

  // Load emojis, folders, and credits from database when user is authenticated
  // Profile creation is now handled automatically by middleware
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Check if returning from successful payment
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('success') === 'true') {
        handlePaymentSuccess();
      } else {
        fetchEmojis();
        fetchFolders();
        fetchCredits();
      }
    }
  }, [isLoaded, isSignedIn, handlePaymentSuccess, fetchEmojis, fetchFolders, fetchCredits]);

  const handleGenerate = async (prompt: string) => {
    if (credits <= 0) {
      setIsUpgradeModalOpen(true);
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
      
      // API now returns { success: true, emoji: { id, imageUrl, prompt, ... }, credits: number }
      if (data.success && data.emoji) {
        const newEmoji: Emoji = {
          id: data.emoji.id.toString(),
          imageUrl: data.emoji.imageUrl,
          title: data.emoji.prompt,
          folderId: null,
          isLiked: false,
          likesCount: data.emoji.likesCount || 0,
          createdAt: new Date(data.emoji.createdAt).getTime(),
        };

        // Add new emoji to the top of the grid
        setEmojis((prev) => [newEmoji, ...prev]);
        
        // Update credits with server-returned value
        if (typeof data.credits === 'number') {
          setCredits(data.credits);
        }
      }
    } catch (error) {
      console.error('Error generating emoji:', error);
      alert('Failed to generate emoji. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (id: string) => {
    // Optimistic update - update UI immediately
    const emoji = emojis.find((e) => e.id === id);
    if (!emoji) return;

    const wasLiked = emoji.isLiked;
    const newLikesCount = wasLiked 
      ? (emoji.likesCount || 0) - 1 
      : (emoji.likesCount || 0) + 1;

    setEmojis((prev) =>
      prev.map((e) =>
        e.id === id 
          ? { ...e, isLiked: !e.isLiked, likesCount: newLikesCount } 
          : e
      )
    );

    // Call API to persist the like/unlike
    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emojiId: parseInt(id) }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }

      const data = await response.json();

      // Update with actual data from server
      if (data.success) {
        setEmojis((prev) =>
          prev.map((e) =>
            e.id === id 
              ? { ...e, isLiked: data.isLiked, likesCount: data.likesCount } 
              : e
          )
        );
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      setEmojis((prev) =>
        prev.map((e) =>
          e.id === id 
            ? { ...e, isLiked: wasLiked, likesCount: emoji.likesCount || 0 } 
            : e
        )
      );
      alert('Failed to update like. Please try again.');
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (data.success && data.folder) {
        setFolders((prev) => [...prev, data.folder]);
      } else {
        alert('Failed to create folder. Please try again.');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Failed to create folder. Please try again.');
    }
  };

  const handleRenameFolder = async (id: string, newName: string) => {
    try {
      const response = await fetch('/api/folders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, name: newName }),
      });

      const data = await response.json();

      if (data.success && data.folder) {
        setFolders((prev) =>
          prev.map((folder) =>
            folder.id === id ? data.folder : folder
          )
        );
      } else {
        alert('Failed to rename folder. Please try again.');
      }
    } catch (error) {
      console.error('Error renaming folder:', error);
      alert('Failed to rename folder. Please try again.');
    }
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      const response = await fetch(`/api/folders?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Remove folder from state
        setFolders((prev) => prev.filter((folder) => folder.id !== id));
        
        // Move emojis from this folder to "All" (set folderId to null)
        // The database cascade will handle removing emoji_folders entries
        setEmojis((prev) =>
          prev.map((emoji) =>
            emoji.folderId === id ? { ...emoji, folderId: null } : emoji
          )
        );
      } else {
        alert('Failed to delete folder. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      alert('Failed to delete folder. Please try again.');
    }
  };

  const handleOpenFolderModal = (emojiId: string) => {
    setSelectedEmojiId(emojiId);
    setIsFolderModalOpen(true);
  };

  const handleAssignEmojiToFolder = async (folderId: string | null, newFolderName?: string) => {
    if (!selectedEmojiId) return;

    try {
      // If creating a new folder first
      if (newFolderName) {
        const createResponse = await fetch('/api/folders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newFolderName }),
        });

        const createData = await createResponse.json();

        if (createData.success && createData.folder) {
          setFolders((prev) => [...prev, createData.folder]);
          folderId = createData.folder.id;
        } else {
          alert('Failed to create folder. Please try again.');
          return;
        }
      }

      // Assign emoji to folder (or remove from folder if folderId is null)
      const response = await fetch(`/api/emojis/${selectedEmojiId}/folder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folderId }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setEmojis((prev) =>
          prev.map((emoji) =>
            emoji.id === selectedEmojiId ? { ...emoji, folderId: data.folderId } : emoji
          )
        );
      } else {
        alert('Failed to assign emoji to folder. Please try again.');
      }
    } catch (error) {
      console.error('Error assigning emoji to folder:', error);
      alert('Failed to assign emoji to folder. Please try again.');
    } finally {
      setSelectedEmojiId(null);
    }
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
      <Header credits={credits} onUpgradeClick={() => setIsUpgradeModalOpen(true)} />
      
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
          
          <div className="flex flex-col gap-[16px]">
            <div className="flex flex-col gap-[16px] pb-[16px]">
              <h2 className="font-semibold text-[24px] leading-[32px] text-slate-950 tracking-[-0.144px]">
                Emoji you have generated so far
              </h2>
              <div className="w-full h-px bg-slate-200" />
            </div>
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

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentCredits={credits}
        currentTier={currentTier}
      />
    </div>
  );
}
