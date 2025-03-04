import { useNavigate } from 'react-router';
import { Content } from '../../types/content';
import { useContent, useContentOperations } from '../../contexts/ContentContext';

// Mock data - In a real app, this would come from an API
const mockContent: Content[] = [
  {
    id: 1,
    type: 'podcast',
    title: 'Tech Talk Episode 1',
    url: '/mock/podcast1.mp3',
    sections: [
      { id: 1, name: 'Introduction', start: 0 },
      { id: 2, name: 'Main Discussion', start: 300 },
      { id: 3, name: 'Conclusion', start: 1200 }
    ]
  },
  {
    id: 2,
    type: 'article',
    title: 'Understanding TypeScript',
    content: '<h2>Introduction</h2><p>TypeScript is a powerful tool...</p>',
    sections: [
      { id: 4, name: 'Introduction', content: 'TypeScript is a powerful tool...' },
      { id: 5, name: 'Basic Types', content: 'TypeScript includes several basic types...' }
    ]
  },
  {
    id: 3,
    type: 'pdf',
    title: 'React Best Practices',
    url: '/mock/react-guide.pdf',
    sections: [
      { id: 6, name: 'Chapter 1: Introduction', page: 1 },
      { id: 7, name: 'Chapter 2: Components', page: 15 }
    ]
  }
];

interface ContentCardProps {
  content: Content;
}

function ContentCard({ content }: ContentCardProps) {
  const navigate = useNavigate();
  const { setContent } = useContentOperations();

  const handleClick = () => {
    setContent(content);
    navigate(`/content/${content.id}`);
  };

  // Helper function to get content type icon or emoji
  const getContentTypeIcon = (type: Content['type']) => {
    switch (type) {
      case 'podcast':
        return '🎙️';
      case 'audiobook':
        return '🎧';
      case 'article':
        return '📄';
      case 'pdf':
        return '📑';
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
      <div className="mt-2 text-sm text-gray-600">
        {content.sections.length} sections
      </div>
      <div className="mt-2 text-xs text-gray-400">
        Click to view content
      </div>
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
          {mockContent.length} items available
        </div>
      </div>
      
      {state.error && (
        <div className="text-red-500 mb-4 p-4 bg-red-50 rounded-md">
          {state.error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* In a real app, we'd use state.content instead of mockContent */}
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