import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import { useContent, useContentOperations } from '../../contexts/ContentContext';
import { ContentType, Content } from '../../types/content';
import ArticleQuoteExtractor from './quotes/ArticleQuoteExtractor';
import AudioQuoteExtractor from './quotes/AudioQuoteExtractor';
import { AddNoteButton } from './notes/NoteEditor';
import { SectionNotes } from './notes/NoteList';

// Audio content viewer component
function AudioContentViewer() {
  const { state } = useContent();
  const content = state.activeContent;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!content || !content.url) return null;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <audio
        ref={audioRef}
        className="w-full mt-4"
        controls
        src={content.url}
      >
        Your browser does not support the audio element.
      </audio>
      <div className="mt-4">
        {content.sections.map((section) => (
          <div key={section.id} className="mb-6">
            <div className="p-3 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{section.name}</div>
                  {section.start !== undefined && (
                    <div className="text-sm text-gray-500">
                      Starts at: {Math.floor(section.start / 60)}:{(section.start % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                </div>
                <AddNoteButton sectionId={section.id} />
              </div>
            </div>
            <SectionNotes sectionId={section.id} sectionName={section.name} />
          </div>
        ))}
      </div>
      <AudioQuoteExtractor audioRef={audioRef} />
    </div>
  );
}

// Article content viewer component
function ArticleContentViewer() {
  const { state } = useContent();
  const content = state.activeContent;

  if (!content || !content.content) return null;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8">
        {content.sections.map((section) => (
          <div key={section.id} className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">{section.name}</h2>
              <AddNoteButton sectionId={section.id} />
            </div>
            {section.content && (
              <div 
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            )}
            <SectionNotes sectionId={section.id} sectionName={section.name} />
          </div>
        ))}
      </div>
      <ArticleQuoteExtractor />
    </div>
  );
}

// PDF content viewer component (placeholder - needs react-pdf integration)
function PDFContentViewer() {
  const { state } = useContent();
  const content = state.activeContent;

  if (!content || !content.url) return null;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-gray-100 p-4 rounded">
        PDF Viewer placeholder for: {content.url}
      </div>
      {content.sections.map((section) => (
        <div key={section.id} className="mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">{section.name}</h2>
            <AddNoteButton sectionId={section.id} />
          </div>
          <SectionNotes sectionId={section.id} sectionName={section.name} />
        </div>
      ))}
    </div>
  );
}

// Mock function to simulate content loading - replace with actual API call
const fetchContent = async (id: string): Promise<Content> => {
  // Simulating API call
  const mockContent: Content = {
    id: parseInt(id),
    type: 'article',
    title: 'Sample Article',
    content: '<h2>Introduction</h2><p>This is a sample article content.</p>',
    sections: [
      { id: 1, name: 'Introduction', content: 'Introduction section' },
      { id: 2, name: 'Main Content', content: 'Main content section' }
    ]
  };
  
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockContent), 1000);
  });
};

// Main content viewer component
export default function ContentViewer() {
  const { id } = useParams<{ id: string }>();
  const { state } = useContent();
  const { setContent, setLoading, setError } = useContentOperations();
  const { activeContent, isLoading, error } = state;

  useEffect(() => {
    if (!id) return;

    const loadContent = async () => {
      try {
        setLoading(true);
        const content = await fetchContent(id);
        setContent(content);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
    // State setter functions from context are stable and don't need to be dependencies
  }, [id]);

  if (isLoading) {
    return <div className="text-center py-8">Loading content...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!activeContent) {
    return <div className="text-center py-8">No content selected</div>;
  }

  const renderContentByType = (type: ContentType) => {
    switch (type) {
      case 'podcast':
      case 'audiobook':
        return <AudioContentViewer />;
      case 'article':
        return <ArticleContentViewer />;
      case 'pdf':
        return <PDFContentViewer />;
      default:
        return <div>Unsupported content type</div>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{activeContent.title}</h1>
      {renderContentByType(activeContent.type)}
    </div>
  );
}