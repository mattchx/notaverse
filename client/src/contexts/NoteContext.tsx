import React, { createContext, useContext, useReducer } from 'react';

interface Note {
  id: number;
  contentId: number;
  text: string;
  timestamp?: number;  // For podcasts
  pageNumber?: number; // For books
  quote?: string;     // Optional quote
  createdAt: number;
}

interface NoteState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
}

type NoteAction =
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'SET_NOTES'; payload: Note[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_NOTES' };

const initialState: NoteState = {
  notes: [],
  isLoading: false,
  error: null,
};

const NoteContext = createContext<{
  state: NoteState;
  dispatch: React.Dispatch<NoteAction>;
} | undefined>(undefined);

function noteReducer(state: NoteState, action: NoteAction): NoteState {
  switch (action.type) {
    case 'ADD_NOTE':
      return {
        ...state,
        notes: [...state.notes, action.payload],
        error: null,
      };
    case 'SET_NOTES':
      return {
        ...state,
        notes: action.payload,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'CLEAR_NOTES':
      return {
        ...initialState,
      };
    default:
      return state;
  }
}

export function NoteProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(noteReducer, initialState);

  return (
    <NoteContext.Provider value={{ state, dispatch }}>
      {children}
    </NoteContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
}

export function useNoteOperations() {
  const { dispatch } = useNotes();

  return {
    addNote: (note: Omit<Note, 'id'>) => {
      // In a real app, the ID would come from the backend
      const newNote: Note = {
        ...note,
        id: Date.now(),
      };
      dispatch({ type: 'ADD_NOTE', payload: newNote });
    },
    setNotes: (notes: Note[]) => {
      dispatch({ type: 'SET_NOTES', payload: notes });
    },
    clearNotes: () => {
      dispatch({ type: 'CLEAR_NOTES' });
    },
    setLoading: (loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    },
    setError: (error: string) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    },
  };
}

// Helper hook to get notes for a specific content
export function useContentNotes(contentId: number) {
  const { state } = useNotes();
  return state.notes.filter(note => note.contentId === contentId);
}