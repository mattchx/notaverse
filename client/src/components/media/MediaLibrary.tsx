import { useNavigate } from 'react-router';
import { MediaItem } from '../../types';
import { useMedia, useMediaOperations } from '../../contexts/MediaContext';
import { Button } from '@/components/ui/button';

// Mock data - In a real app, this would come from an API
export const mockData: MediaItem[] = [
  {
    id: '1',
    type: 'podcast',
    name: 'Tech Talk Episode 1', // This should match what's used in MediaCard
    sections: [
      {
        id: '1',
        name: 'Introduction',
        order: 0,
        markers: [
          {
            id: '1',
            position: '1:12',
            order: 1,
            quote: 'This is a test quote',
            note: 'This is a test note'
          },
          {
            id: '2',
            position: '1:45',
            order: 2,
            quote: 'This is a test quote',
            note: 'This is a test note'
          },
        ]
      },
      // { id: '2', name: 'Main Discussion', order: 1 },
    ]
  }
];

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
      <div className="mt-2 text-xs text-gray-400">
        {item.sections.length} sections
      </div>
    </div>
  );
}

export default function MediaLibrary() {
  const { state } = useMedia();

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6 mx-6">
        <h1 className="text-3xl font-bold">Library</h1>
        <div className="text-sm text-gray-500">
          {mockData.length} items
        </div>
        <Button variant='outline'>+ Add Media Item</Button>
      </div>

      {state.error && (
        <div className="text-red-500 mb-4 p-4 bg-red-50 rounded-md">
          {state.error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockData.map((item) => (
          <MediaItemCard key={item.id} item={item} />
        ))}
      </div>

      {mockData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No media items available
        </div>
      )}
    </div>
  );
}