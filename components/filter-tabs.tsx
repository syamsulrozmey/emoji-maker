'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Folder } from '@/types/emoji';
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
import { Input } from '@/components/ui/input';

interface FilterTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  folders: Folder[];
  onCreateFolder: () => void;
  onRenameFolder: (id: string, newName: string) => void;
  onDeleteFolder: (id: string) => void;
}

export function FilterTabs({
  activeTab,
  onTabChange,
  folders,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}: FilterTabsProps) {
  const [menuOpenForFolder, setMenuOpenForFolder] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenForFolder(null);
      }
    };

    if (menuOpenForFolder) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [menuOpenForFolder]);

  const handleDeleteClick = (folder: Folder) => {
    setSelectedFolder(folder);
    setDeleteDialogOpen(true);
    setMenuOpenForFolder(null);
  };

  const handleRenameClick = (folder: Folder) => {
    setSelectedFolder(folder);
    setRenameValue(folder.name);
    setRenameDialogOpen(true);
    setMenuOpenForFolder(null);
  };

  const handleDeleteConfirm = () => {
    if (selectedFolder) {
      onDeleteFolder(selectedFolder.id);
      if (activeTab === selectedFolder.id) {
        onTabChange('All');
      }
    }
    setDeleteDialogOpen(false);
    setSelectedFolder(null);
  };

  const handleRenameConfirm = () => {
    if (selectedFolder && renameValue.trim()) {
      onRenameFolder(selectedFolder.id, renameValue.trim());
    }
    setRenameDialogOpen(false);
    setSelectedFolder(null);
    setRenameValue('');
  };

  return (
    <>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onTabChange('All')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'All'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All
          </button>

          {folders.map((folder) => (
            <div key={folder.id} className="relative group">
              <button
                onClick={() => onTabChange(folder.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors pr-8 ${
                  activeTab === folder.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {folder.name}
              </button>
              <div className="absolute right-1 top-1/2 -translate-y-1/2">
                <button
                  onClick={() =>
                    setMenuOpenForFolder(
                      menuOpenForFolder === folder.id ? null : folder.id
                    )
                  }
                  className="p-1 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-3 w-3 text-gray-600" />
                </button>
                {menuOpenForFolder === folder.id && (
                  <div 
                    ref={menuRef}
                    className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[140px]"
                  >
                    <button
                      onClick={() => handleRenameClick(folder)}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Pencil className="h-3 w-3" />
                      Rename
                    </button>
                    <button
                      onClick={() => handleDeleteClick(folder)}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 text-red-600 flex items-center gap-2"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={onCreateFolder}
          variant="outline"
          className="flex items-center gap-2 rounded-lg !bg-orange-700 hover:!bg-orange-600 text-white border-0"
        >
          <Plus className="h-4 w-4" />
          Add folder
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedFolder?.name}&quot;?
              Emojis in this folder will not be deleted, but they will be moved to
              &quot;All&quot;.
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

      {/* Rename Dialog */}
      <AlertDialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a new name for &quot;{selectedFolder?.name}&quot;
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && renameValue.trim()) {
                  handleRenameConfirm();
                }
              }}
              placeholder="Folder name"
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRenameConfirm}
              disabled={!renameValue.trim()}
            >
              Rename
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
