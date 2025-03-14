/** Table view for managing media items with sorting and actions */
import React, { useEffect, useState } from 'react';
import { ArrowUpDown, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router';
import { AddMediaModal } from './AddMediaModal';
import { EditMediaModal } from './EditMediaModal';
import { Button } from '@/components/ui/button';
import { MediaItem } from '@/types';
import { useMedia, useMediaOperations } from '@/contexts/MediaContext';
import { get as apiGet, del as apiDelete } from '@/utils/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/** Configuration type for column sorting */
type SortConfig = {
  key: keyof MediaItem;
  direction: 'asc' | 'desc';
} | null;

/** @returns Table interface for viewing and managing media items */
export default function MediaLibrary() {
  const navigate = useNavigate();
  const { state } = useMedia();
  const { setMediaList, setLoading, setError, deleteMedia } = useMediaOperations();
  const [open, setOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<MediaItem | null>(null);
  const [mediaToEdit, setMediaToEdit] = useState<MediaItem | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  /** Memoized sorted items based on current sort configuration */
  const sortedItems = React.useMemo(() => {
    if (!sortConfig) return state.mediaItems;

    return [...state.mediaItems].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === bValue) return 0;
      
      const multiplier = sortConfig.direction === 'asc' ? 1 : -1;
      
      if (aValue === undefined || aValue === null) return 1 * multiplier;
      if (bValue === undefined || bValue === null) return -1 * multiplier;
      
      return aValue < bValue ? -1 * multiplier : 1 * multiplier;
    });
  }, [state.mediaItems, sortConfig]);

  /** Cycles sort direction: null -> asc -> desc -> null */
  const toggleSort = (key: keyof MediaItem) => {
    setSortConfig(current => {
      if (current?.key !== key) {
        return { key, direction: 'asc' };
      }
      
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      
      return null;
    });
  };

  /** Deletes media item and updates UI optimistically */
  const handleDelete = async () => {
    if (!mediaToDelete) return;
    
    const idToDelete = mediaToDelete.id;
    
    // Close dialog first
    setShowDeleteDialog(false);
    setMediaToDelete(null);
    
    try {
      // Delete from server - ignoring return since it's a 204
      await apiDelete(`/media/${idToDelete}`, {
        credentials: 'include'
      });
      
      // Update local state
      deleteMedia(idToDelete);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete media item');
    }
  };

  /** Shows delete confirmation dialog and prevents navigation */
  const confirmDelete = (e: React.MouseEvent, mediaItem: MediaItem) => {
    e.stopPropagation(); // Prevent navigation
    setMediaToDelete(mediaItem);
    setShowDeleteDialog(true);
  };

  useEffect(() => {
    async function fetchMedia() {
      setLoading(true);
      try {
        const media = await apiGet<MediaItem[]>('/media');
        setMediaList(media);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch media items');
      } finally {
        setLoading(false);
      }
    }

    fetchMedia();
  }, []);

  /** Navigates to media item detail view */
  const handleCardClick = (mediaItem: MediaItem) => {
    navigate(`/library/item/${mediaItem.id}`);
  };

  if (state.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Media Library</h1>
        <Button onClick={() => setOpen(true)}>Add Media</Button>
      </div>

      {state.error && (
        <div className="text-red-500 mb-4">
          {state.error}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort('name')}
                  className="h-8 px-2 hover:bg-transparent"
                >
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort('author')}
                  className="h-8 px-2 hover:bg-transparent"
                >
                  Author
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort('type')}
                  className="h-8 px-2 hover:bg-transparent"
                >
                  Type
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Sections</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.map((mediaItem) => (
              <TableRow
                key={mediaItem.id}
                onClick={() => handleCardClick(mediaItem)}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="font-medium">{mediaItem.name}</TableCell>
                <TableCell>{mediaItem.author || '-'}</TableCell>
                <TableCell className="capitalize">{mediaItem.type}</TableCell>
                <TableCell>{mediaItem.sections.length}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMediaToEdit(mediaItem);
                        setShowEditDialog(true);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete(e, mediaItem);
                      }}
                      className="h-8 w-8 p-0 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {state.mediaItems.length === 0 && !state.isLoading && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Sections</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <p className="text-gray-500 mb-4">No media items in your library</p>
                  <Button onClick={() => setOpen(true)}>
                    Add Your First Media
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) setMediaToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Media</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{mediaToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={state.isLoading}>
              {state.isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddMediaModal
        open={open}
        onOpenChange={setOpen}
      />

      <EditMediaModal
        open={showEditDialog}
        onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) setMediaToEdit(null);
        }}
        mediaItem={mediaToEdit}
      />
    </div>
  );
}