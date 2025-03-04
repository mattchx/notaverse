import React from 'react';
import { ContentProvider, useContent, useContentOperations } from './ContentContext';
import { NoteProvider, useNotes, useNoteOperations } from './NoteContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ContentProvider>
      <NoteProvider>
        {children}
      </NoteProvider>
    </ContentProvider>
  );
}

// Export a combined hook for accessing all contexts
export function useAppState() {
  const { state: contentState } = useContent();
  const { state: noteState } = useNotes();
  const contentOps = useContentOperations();
  const noteOps = useNoteOperations();

  return {
    state: {
      content: contentState,
      notes: noteState,
    },
    operations: {
      content: contentOps,
      notes: noteOps,
    }
  };
}