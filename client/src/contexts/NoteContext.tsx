import React, { createContext, useContext, useReducer } from 'react';
import { Note } from '../types/content';

interface NoteState {
  notes: Note[];
  activeNote: Note | null;
  isLoading: boolean;
  error: string | null;
}

type NoteAction =
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: number }
  | { type: 'SET_ACTIVE_NOTE'; payload: Note | null }
  | { type: 'SET_NOTES'; payload: Note[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string };

const initialState: NoteState = {
  notes: [],
  activeNote: null,
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
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.id === action.payload.id ? action.payload : note
        ),
        activeNote:
          state.activeNote?.id === action.payload.id
            ? action.payload
            : state.activeNote,
        error: null,
      };
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter((note) => note.id !== action.payload),
        activeNote:
          state.activeNote?.id === action.payload ? null : state.activeNote,
        error: null,
      };
    case 'SET_ACTIVE_NOTE':
      return {
        ...state,
        activeNote: action.payload,
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

// Helper hooks and functions
export function useNoteOperations() {
  const { dispatch } = useNotes();

  return {
    addNote: (note: Note) => {
      dispatch({ type: 'ADD_NOTE', payload: note });
    },
    updateNote: (note: Note) => {
      dispatch({ type: 'UPDATE_NOTE', payload: note });
    },
    deleteNote: (noteId: number) => {
      dispatch({ type: 'DELETE_NOTE', payload: noteId });
    },
    setActiveNote: (note: Note | null) => {
      dispatch({ type: 'SET_ACTIVE_NOTE', payload: note });
    },
    setNotes: (notes: Note[]) => {
      dispatch({ type: 'SET_NOTES', payload: notes });
    },
    setLoading: (loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    },
    setError: (error: string) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    },
  };
}

// Utility hooks for common note operations
export function useNotesByContent(contentId: number) {
  const { state } = useNotes();
  return state.notes.filter((note) => note.contentId === contentId);
}

export function useNotesBySection(sectionId: number) {
  const { state } = useNotes();
  return state.notes.filter((note) => note.sectionId === sectionId);
}

export function useSectionNoteSummary(sectionId: number) {
  const notes = useNotesBySection(sectionId);
  return notes.map(note => ({
    id: note.id,
    text: note.text,
    createdAt: note.createdAt,
  }));
}

export function useActiveNote() {
  const { state } = useNotes();
  return state.activeNote;
}