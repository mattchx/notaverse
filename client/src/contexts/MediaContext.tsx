import React, { createContext, useContext, useReducer } from 'react';
import { MediaItem } from '../types';

interface MediaState {
  activeMedia: MediaItem | null;
  isLoading: boolean;
  error: string | null;
}

type MediaAction =
  | { type: 'SET_MEDIA'; payload: MediaItem }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_MEDIA' };

// Initial state
const initialState: MediaState = {
  activeMedia: null,
  isLoading: false,
  error: null,
};

// Create context
const MediaContext = createContext<{
  state: MediaState;
  dispatch: React.Dispatch<MediaAction>;
} | undefined>(undefined);

// Media reducer
function mediaReducer(state: MediaState, action: MediaAction): MediaState {
  switch (action.type) {
    case 'MEDIA':
      return {
        ...state,
        activeMedia: action.payload,
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
    case 'CLEAR_MEDIA':
      return {
        ...initialState,
      };
    default:
      return state;
  }
}

// Provider component
export function MediaProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(mediaReducer, initialState);

  return (
    <MediaContext.Provider value={{ state, dispatch }}>
      {children}
    </MediaContext.Provider>
  );
}

// Custom hook for using Media context
export function useMedia() {
  const context = useContext(MediaContext);
  if (context === undefined) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
}

// Helper hooks for common operations
export function useActiveMedia() {
  const { state } = useMedia();
  return state.activeMedia;
}

// Helper functions for common operations
export function useMediaOperations() {
  const { dispatch } = useMedia();

  return {
    setMedia: (Media: MediaSection) => {
      dispatch({ type: 'SET_Media', payload: Media });
    },
    clearMedia: () => {
      dispatch({ type: 'CLEAR_Media' });
    },
    setLoading: (loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    },
    setError: (error: string) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    },
  };
}