import React, { createContext, useContext, useReducer } from 'react';
import { ContentSection } from '../types';

interface ContentState {
  activeContent: ContentSection | null;
  isLoading: boolean;
  error: string | null;
}

type ContentAction =
  | { type: 'SET_CONTENT'; payload: ContentSection }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_CONTENT' };

// Initial state
const initialState: ContentState = {
  activeContent: null,
  isLoading: false,
  error: null,
};

// Create context
const ContentContext = createContext<{
  state: ContentState;
  dispatch: React.Dispatch<ContentAction>;
} | undefined>(undefined);

// Content reducer
function contentReducer(state: ContentState, action: ContentAction): ContentState {
  switch (action.type) {
    case 'SET_CONTENT':
      return {
        ...state,
        activeContent: action.payload,
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
    case 'CLEAR_CONTENT':
      return {
        ...initialState,
      };
    default:
      return state;
  }
}

// Provider component
export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(contentReducer, initialState);

  return (
    <ContentContext.Provider value={{ state, dispatch }}>
      {children}
    </ContentContext.Provider>
  );
}

// Custom hook for using content context
export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}

// Helper hooks for common operations
export function useActiveContent() {
  const { state } = useContent();
  return state.activeContent;
}

// Helper functions for common operations
export function useContentOperations() {
  const { dispatch } = useContent();

  return {
    setContent: (content: ContentSection) => {
      dispatch({ type: 'SET_CONTENT', payload: content });
    },
    clearContent: () => {
      dispatch({ type: 'CLEAR_CONTENT' });
    },
    setLoading: (loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    },
    setError: (error: string) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    },
  };
}