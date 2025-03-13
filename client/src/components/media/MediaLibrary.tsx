import React, { useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { AddMediaModal } from './AddMediaModal';
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

export default function MediaLibrary() {
  const navigate = useNavigate();
  const { state } = useMedia();
  const { setMediaList, setLoading, setError, deleteMedia } = useMediaOperations();
  const [open, setOpen] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [mediaToDelete, setMediaToDelete] = React.useState<MediaItem | null>(null);

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.mediaItems.map((mediaItem) => (
          <div
            key={mediaItem.id}
            className="border rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => handleCardClick(mediaItem)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">{mediaItem.name}</h2>
                {mediaItem.author && (
                  <p className="text-gray-600">{mediaItem.author}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => confirmDelete(e, mediaItem)}
                className="h-8 w-8 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span className="capitalize">{mediaItem.type}</span>
              <span>{mediaItem.sections.length} sections</span>
            </div>

          </div>
        ))}
      </div>

      {state.mediaItems.length === 0 && !state.isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No media items yet</p>
          <Button onClick={() => setOpen(true)}>
            Add Your First Media
          </Button>
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
    </div>
  );
}