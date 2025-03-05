import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { useContent, useContentOperations } from '../../contexts/ContentContext';
import { useNoteOperations, useContentNotes } from '../../contexts/NoteContext';
import { Section } from '../../types';
import { Button } from '../ui/button';

// Simple note input component
function NoteInput({ mediaItemId }: { mediaItemId: string }) {
  const [note, setNote] = React.useState('');
  const [metadata, setMetadata] = React.useState('');
  const { addNote } = useNoteOperations();
  const { state } = useContent();
  const content = state.activeContent;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;

    const newNote = {
      mediaItemId,
      text: note,
      ...(content.type === 'podcast' 
        ? { timestamp: Number(metadata) || undefined }
        : { pageNumber: Number(metadata) || undefined }
      ),
      createdAt: Date.now()
    };

    addNote(newNote);
    setNote('');
    setMetadata('');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note..."
          className="w-full p-2 border rounded-md"
          rows={3}
        />
      </div>
      <div>
        <input
          type="text"
          value={metadata}
          onChange={(e) => setMetadata(e.target.value)}
          placeholder={content?.type === 'podcast' ? 'Timestamp (in seconds)' : 'Page number'}
          className="w-full p-2 border rounded-md"
        />
      </div>
      <Button type="submit">Add Note</Button>
    </form>
  );
}

// Note list component
function NoteList({ mediaItemId }: { mediaItemId: string }) {
  const notes = useContentNotes(mediaItemId);

  if (notes.length === 0) {
    return <p className="text-gray-500">No notes yet</p>;
  }

  const formatMetadata = (note: typeof notes[0]) => {
    if (note.timestamp !== undefined) {
      const minutes = Math.floor(note.timestamp / 60);
      const seconds = note.timestamp % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    if (note.pageNumber !== undefined) {
      return `Page ${note.pageNumber}`;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {notes.map(note => (
        <div key={note.id} className="p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-start">
            <p className="text-gray-800">{note.text}</p>
            {formatMetadata(note) && (
              <span className="text-sm text-gray-500 ml-4">
                {formatMetadata(note)}
              </span>
            )}
          </div>
          {note.quote && (
            <blockquote className="mt-2 pl-4 border-l-2 border-gray-300 text-gray-600">
              {note.quote}
            </blockquote>
          )}
          <div className="mt-2 text-xs text-gray-400">
            {new Date(note.createdAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}

// Main content viewer component
export default function ContentViewer() {
  const { id } = useParams<{ id: string }>();
  const { state } = useContent();
  const { setContent, setLoading, setError } = useContentOperations();
  const { activeContent, isLoading, error } = state;
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!id) return;

    const fetchContent = async () => {
      try {
        setLoading(true);
        // Simulating API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock content
        const content: Section = {
          id: parseInt(id),
          type: 'book',
          title: 'Sample Book',
          description: 'A sample book for taking notes'
        };
        
        setContent(content);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);
  // setContent, setError, setLoading
  
  if (isLoading) {
    return <div className="text-center py-8">Loading content...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!activeContent) {
    return <div className="text-center py-8">No content selected</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back
        </Button>
        <h1 className="text-3xl font-bold">{activeContent.title}</h1>
        {activeContent.description && (
          <p className="text-gray-600 mt-2">{activeContent.description}</p>
        )}
      </div>

      <div className="space-y-6">
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Take Notes</h2>
          <p className="text-gray-600 mb-4">
            Add notes with {activeContent.type === 'podcast' ? 'timestamps' : 'page numbers'}
          </p>
          <NoteInput mediaItemId={activeContent.id} />
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Notes</h2>
          <NoteList mediaItemId={activeContent.id} />
        </div>
      </div>
    </div>
  );
}