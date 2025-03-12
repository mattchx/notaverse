import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { get as apiGet } from '../../utils/api';
import { MediaItem } from '../../types';
import { useMedia, useMediaOperations } from '../../contexts/MediaContext';
import { Button } from '@/components/ui/button';
import { AddMediaModal } from './AddMediaModal';

function MediaItemCard({ item }: { item: MediaItem }) {
  const navigate = useNavigate();
  const { setMedia } = useMediaOperations();

  const handleClick = () => {
    setMedia(item);
    navigate(`/library/book/${item.id}`);
  };

  // Helper function to get media item type icon
  const getMediaTypeIcon = (type: MediaItem['type']) => {
    switch (type) {
      case 'podcast':
        return '🎙️';
      case 'book':
        return '📚';
      default:
        return '📝';
    }
  };

  return (
    <div
      onClick={handleClick}
      className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{getMediaTypeIcon(item.type)}</span>
        <div>
          <div className="text-lg font-semibold">{item.name}</div>
          <div className="text-sm text-gray-500 capitalize">{item.type}</div>
        </div>
      </div>
      {/* <div className="mt-2 text-xs text-gray-400">
        {item.sections.length} sections
      </div> */}
    </div>
  );
}

export default function MediaLibrary() {
  const { state } = useMedia();
  const { setError, setLoading } = useMediaOperations();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    let mounted = true;

    async function fetchMediaItems() {
      if (!mounted) return;
      
      try {
        setLoading(true);
        const data = await apiGet<MediaItem[]>('/media', {
          credentials: 'include'
        });
        setMediaItems(data);
      } catch (error) {
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Failed to fetch media items');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchMediaItems();

    return () => {
      mounted = false;
    };
  }, []); // Remove dependencies to prevent re-fetching

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6 mx-6">
        <h1 className="text-3xl font-bold">Library</h1>
        <div className="text-sm text-gray-500">
          {mediaItems.length} items
        </div>
        <Button variant='outline' onClick={() => setIsAddModalOpen(true)}>
          + Add Media Item
        </Button>
      </div>

      {state.error && (
        <div className="text-red-500 mb-4 p-4 bg-red-50 rounded-md">
          {state.error}
        </div>
      )}

      {state.isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mediaItems.map((item) => (
              <MediaItemCard key={item.id} item={item} />
            ))}
          </div>

          {mediaItems.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No media items available
            </div>
          )}
        </>
      )}

      <AddMediaModal 
        open={isAddModalOpen} 
        onOpenChange={setIsAddModalOpen} 
      />
    </div>
  );
}