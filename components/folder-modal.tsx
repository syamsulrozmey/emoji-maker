'use client';

import { useState, useEffect } from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Folder } from '@/types/emoji';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (folderId: string | null, newFolderName?: string) => void;
  currentFolderId?: string | null;
  folders: Folder[];
}

export function FolderModal({
  isOpen,
  onClose,
  onSave,
  currentFolderId,
  folders,
}: FolderModalProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
    currentFolderId || null
  );
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setSelectedFolderId(currentFolderId || null);
    setIsCreatingNew(false);
    setNewFolderName('');
    setError('');
  }, [isOpen, currentFolderId]);

  const handleSave = () => {
    if (isCreatingNew) {
      const trimmedName = newFolderName.trim();
      
      if (!trimmedName) {
        setError('Folder name cannot be empty');
        return;
      }

      if (folders.some((f) => f.name === trimmedName)) {
        setError('A folder with this name already exists');
        return;
      }

      onSave(null, trimmedName);
    } else {
      onSave(selectedFolderId);
    }
    
    handleClose();
  };

  const handleClose = () => {
    setIsCreatingNew(false);
    setNewFolderName('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Move to Folder</DialogTitle>
          <DialogDescription>
            Choose a folder for this emoji or create a new one.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <RadioGroup
            value={isCreatingNew ? 'new' : selectedFolderId || 'none'}
            onValueChange={(value) => {
              if (value === 'new') {
                setIsCreatingNew(true);
                setSelectedFolderId(null);
              } else if (value === 'none') {
                setIsCreatingNew(false);
                setSelectedFolderId(null);
              } else {
                setIsCreatingNew(false);
                setSelectedFolderId(value);
              }
              setError('');
            }}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="none" />
              <Label htmlFor="none" className="font-normal cursor-pointer">
                None (No folder)
              </Label>
            </div>

            {folders.map((folder) => (
              <div key={folder.id} className="flex items-center space-x-2">
                <RadioGroupItem value={folder.id} id={folder.id} />
                <Label
                  htmlFor={folder.id}
                  className="font-normal cursor-pointer"
                >
                  {folder.name}
                </Label>
              </div>
            ))}

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="new" id="new" />
              <Label htmlFor="new" className="font-normal cursor-pointer">
                Create new folder
              </Label>
            </div>
          </RadioGroup>

          {isCreatingNew && (
            <div className="grid gap-2 pl-6">
              <Input
                value={newFolderName}
                onChange={(e) => {
                  setNewFolderName(e.target.value);
                  setError('');
                }}
                placeholder="Enter folder name..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave();
                  }
                }}
                autoFocus
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

