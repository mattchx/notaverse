import { useNavigate } from 'react-router';
import { ContentSection } from '../../types';
import { useContent, useContentOperations } from '../../contexts/ContentContext';

// Mock data - In a real app, this would come from an API
const mockContent: ContentSection[] = [
  {
    id: 1,
    type: 'podcast',
    title: 'Tech Talk Episode 1',
    description: 'A discussion about modern web development practices'
  },
  {
    id: 2,
    type: 'book',
    title: 'Understanding TypeScript',
    description: 'Comprehensive guide to TypeScript fundamentals'
  }
];

interface ContentCardProps {
  content: ContentSection;
}

function ContentCard({ content }: ContentCardProps) {
  const navigate = useNavigate();
  const { setContent } = useContentOperations();

  const handleClick = () => {
    setContent(content);
    navigate(`/content/${content.id}`);
  };

  // Helper function to get content type icon
  const getContentTypeIcon = (type: ContentSection['type']) => {
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
        <span className="text-xl">{getContentTypeIcon(content.type)}</span>
        <div>
          <div className="text-lg font-semibold">{content.title}</div>
          <div className="text-sm text-gray-500 capitalize">{content.type}</div>
        </div>
      </div>
      {content.description && (
        <div className="mt-2 text-sm text-gray-600">
          {content.description}
        </div>
      )}
    </div>
  );
}

export default function ContentLibrary() {
  const { state } = useContent();

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Content Library</h1>
        <div className="text-sm text-gray-500">
          {mockContent.length} items
        </div>
      </div>
      
      {state.error && (
        <div className="text-red-500 mb-4 p-4 bg-red-50 rounded-md">
          {state.error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockContent.map((content) => (
          <ContentCard key={content.id} content={content} />
        ))}
      </div>

      {mockContent.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No content available
        </div>
      )}
    </div>
  );
}