import { useParams, useNavigate } from 'react-router';
// import { useMedia, useMediaOperations } from '../../contexts/MediaContext';
// import { useNoteOperations, useMediaNotes } from '../../contexts/NoteContext';
import { MediaItem, Section } from '../../types';
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { mockData } from './MediaLibrary'

// Simple marker input component
function MarkerInput({ id }: { id: string }) {
  const [marker, setMarker] = React.useState(mockMarker);
  // const [metadata, setMetadata] = React.useState('');
  // const { addNote } = useNoteOperations();
  const { state } = useMedia();
  const mediaItem = state.activeMedia;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaItem) return;

    const newMarker = {
      id: "new-id",
      position: "pg50",
      order: 1, // Position in the sequence of markers within a section
      quote: null,
      note: "test note",
      dateCreated: Date.now(),
      dateUpdated: null
    };

    // TODO: add log to submit new marker to marker context 
    console.log("newMarker", newMarker)
    // addNote(newNote);
    // setNote('');
    // setMetadata('');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">

      <div className="grid w-full gap-1.5">
        <Label htmlFor="position">Position(page number or timestamp) </Label>
        <Input placeholder="Enter the page number or timestamp." id="position" required />
      </div>
      <div className="grid w-full gap-1.5">
        <Label htmlFor="quote">Quote(optional) </Label>
        <Input placeholder="Enter the text from book or " id="quote" />
      </div>
      <div className="grid w-full gap-1.5">
        <Label htmlFor="message">Order(number) </Label>
        <Input placeholder="Type your message here." id="message" required />
      </div>
      <div className="grid w-full gap-1.5">
        <Label htmlFor="message">Note </Label>
        <Input placeholder="Type your note here." id="message" required />
      </div>
      <Button type="submit">Add Note</Button>
    </form>
  );
}

// // Note list component
// function NoteList({ mediaItemId }: { mediaItemId: string }) {
//   // const notes = useMediaNotes(mediaItemId);

//   if (notes.length === 0) {
//     return <p className="text-gray-500">No notes yet</p>;
//   }


//   return (
//     <div className="space-y-4">
//       {notes.map(note => (
//         <div key={note.id} className="p-4 bg-gray-50 rounded-lg">
//           <div className="flex justify-between items-start">
//             <p className="text-gray-800">{note.text}</p>
//             {formatMetadata(note) && (
//               <span className="text-sm text-gray-500 ml-4">
//                 {formatMetadata(note)}
//               </span>
//             )}
//           </div>
//           {note.quote && (
//             <blockquote className="mt-2 pl-4 border-l-2 border-gray-300 text-gray-600">
//               {note.quote}
//             </blockquote>
//           )}
//           <div className="mt-2 text-xs text-gray-400">
//             {new Date(note.createdAt).toLocaleDateString()}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// Main Media viewer component
export default function MediaViewer() {
  const activeMedia = mockData[0]
  // const { id } = useParams<{ id: string }>();
  // const { state } = useMedia();
  // const { setMedia, setLoading, setError } = useMediaOperations();
  // const { activeMedia, isLoading, error } = state;

  const navigate = useNavigate();

  // React.useEffect(() => {
  //   if (!id) return;

  //   const fetchMedia = async () => {
  //     try {
  //       setLoading(true);
  //       // Simulating API call
  //       await new Promise(resolve => setTimeout(resolve, 500));

  //       // Mock Media
  //       const content: Section = {
  //         id: parseInt(id),
  //         type: 'book',
  //         title: 'Sample Book',
  //         description: 'A sample book for taking notes'
  //       };

  //       setContent(content);
  //     } catch (err) {
  //       setError(err instanceof Error ? err.message : 'Failed to load content');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchContent();
  // }, [id]);
  // setContent, setError, setLoading

  // if (isLoading) {
  //   return <div className="text-center py-8">Loading content...</div>;
  // }

  // if (error) {
  //   return <div className="text-center py-8 text-red-500">{error}</div>;
  // }

  // if (!activeMedia) {
  //   return <div className="text-center py-8">No content selected</div>;
  // }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back
        </Button>
        <h1 className="text-3xl font-bold">{activeMedia.name}</h1>
        <p className="text-3xl font-bold">{activeMedia.author}</p>
      </div>

      <div className="space-y-6">
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Take Notes</h2>
          <p className="text-gray-600 mb-4">
            Add new with {activeMedia.type === 'podcast' ? 'timestamps' : 'page numbers'}
          </p>
          <MarkerInput id={activeMedia.id} />
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Notes</h2>
          {/* <NoteList mediaItemId={activeMedia.id} /> */}
        </div>
      </div>
    </div>
  );
}