'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Header } from '@/components/header';
import { PromptInput } from '@/components/prompt-input';
import { FilterTabs } from '@/components/filter-tabs';
import { EmojiGrid } from '@/components/emoji-grid';
import { AddFolderDialog } from '@/components/add-folder-dialog';
import { FolderModal } from '@/components/folder-modal';
import { ImageLightboxModal } from '@/components/image-lightbox-modal';
import { Emoji, Folder } from '@/types/emoji';
import { syncUserProfile } from '@/lib/profile-sync';

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
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
  const [profileSynced, setProfileSynced] = useState(false);

  // Fetch emojis from Supabase database
  const fetchEmojis = async () => {
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
  };

  // Fetch folders from Supabase database
  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/folders');
      const data = await response.json();
      
      if (data.success && data.folders) {
        setFolders(data.folders);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  // Sync user profile on mount (ensures profile exists in Supabase)
  useEffect(() => {
    const initializeProfile = async () => {
      // Wait for Clerk to load
      if (!isLoaded) return;
      
      // Only sync if user is signed in and we haven't synced yet
      if (isSignedIn && user && !profileSynced) {
        console.log('Syncing user profile...');
        const result = await syncUserProfile();
        
        if (result.success) {
          setProfileSynced(true);
          
          // Update credits from synced profile
          if (result.profile) {
            setCredits(result.profile.credits);
          }
          
          if (result.created) {
            console.log('✅ New profile created for user');
          } else {
            console.log('✅ Profile already exists');
          }
        } else {
          console.error('❌ Failed to sync profile:', result.error);
        }
      }
    };

    initializeProfile();
  }, [isLoaded, isSignedIn, user, profileSynced]);

  // Load emojis and folders from database after profile is synced
  useEffect(() => {
    if (profileSynced) {
      fetchEmojis();
      fetchFolders();
    }
  }, [profileSynced]);

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
      
      // API now returns { success: true, emoji: { id, imageUrl, prompt, ... } }
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
        setCredits((prev) => Math.max(0, prev - 1));
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
