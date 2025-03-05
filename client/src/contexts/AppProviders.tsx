import React from 'react';
import { MediaProvider, useMedia, useMediaOperations } from './MediaContext';
import { NoteProvider, useNotes, useNoteOperations } from './NoteContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <MediaProvider>
      <NoteProvider>
        {children}
      </NoteProvider>
    </MediaProvider>
  );
}

// Export a combined hook for accessing all contexts
export function useAppState() {
  const { state: mediaState } = useMedia();
  const { state: noteState } = useNotes();
  const mediaOps = useMediaOperations();
  const noteOps = useNoteOperations();

  return {
    state: {
      media: mediaState,
      notes: noteState,
    },
    operations: {
      media: mediaOps,
      notes: noteOps,
    }
  };
}