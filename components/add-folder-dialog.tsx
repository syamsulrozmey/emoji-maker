'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (name: string) => void;
  existingFolderNames?: string[];
}

export function AddFolderDialog({
  isOpen,
  onClose,
  onCreateFolder,
  existingFolderNames = [],
}: AddFolderDialogProps) {
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState('');

  const handleCreate = () => {
    const trimmedName = folderName.trim();
    
    if (!trimmedName) {
      setError('Folder name cannot be empty');
      return;
    }

    if (existingFolderNames.includes(trimmedName)) {
      setError('A folder with this name already exists');
      return;
    }

    onCreateFolder(trimmedName);
    setFolderName('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setFolderName('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            Give your folder a name to organize your emojis.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={folderName}
              onChange={(e) => {
                setFolderName(e.target.value);
                setError('');
              }}
              placeholder="e.g., Animals, Food, Work..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreate();
                }
              }}
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} className="!bg-orange-700 hover:!bg-orange-600">Create Folder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

