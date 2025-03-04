import React from 'react';
import { ContentProvider } from './ContentContext';
import { QuoteProvider } from './QuoteContext';
import { NoteProvider } from './NoteContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ContentProvider>
      <QuoteProvider>
        <NoteProvider>
          {children}
        </NoteProvider>
      </QuoteProvider>
    </ContentProvider>
  );
}

// Export a combined hook for accessing all contexts
export function useAppState() {
  const content = ContentProvider;
  const quote = QuoteProvider;
  const note = NoteProvider;

  return {
    content,
    quote,
    note,
  };
}