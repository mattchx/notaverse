import React, { createContext, useContext, useReducer } from 'react';
import { Content, ContentState, ContentAction, Section } from '../types/content';

// Initial state
const initialState: ContentState = {
  activeContent: null,
  activeSection: null,
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
    case 'SET_SECTION':
      return {
        ...state,
        activeSection: action.payload,
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

export function useActiveSection() {
  const { state } = useContent();
  return state.activeSection;
}

// Helper functions for common operations
export function useContentOperations() {
  const { dispatch } = useContent();

  return {
    setContent: (content: Content) => {
      dispatch({ type: 'SET_CONTENT', payload: content });
    },
    setSection: (section: Section) => {
      dispatch({ type: 'SET_SECTION', payload: section });
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