import React, { createContext, useContext, useReducer } from 'react';
import { MediaItem } from '../types';

interface MediaState {
  mediaItems: MediaItem[];
  activeMedia: MediaItem | null;
  isLoading: boolean;
  error: string | null;
}

type MediaAction =
  | { type: 'SET_MEDIA_LIST'; payload: MediaItem[] }
  | { type: 'SET_MEDIA'; payload: MediaItem }
  | { type: 'CREATE_MEDIA'; payload: MediaItem }
  | { type: 'UPDATE_MEDIA'; payload: MediaItem }
  | { type: 'DELETE_MEDIA'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_MEDIA' };

// Initial state
const initialState: MediaState = {
  mediaItems: [],
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
    case 'SET_MEDIA_LIST':
      return {
        ...state,
        mediaItems: action.payload,
        error: null,
      };
    case 'SET_MEDIA':
      return {
        ...state,
        activeMedia: action.payload,
        error: null,
      };
    case 'CREATE_MEDIA':
      return {
        ...state,
        mediaItems: [...state.mediaItems, action.payload],
        activeMedia: action.payload,
        error: null,
      };
    case 'UPDATE_MEDIA':
      return {
        ...state,
        mediaItems: state.mediaItems.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
        activeMedia: state.activeMedia?.id === action.payload.id ? action.payload : state.activeMedia,
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
    case 'DELETE_MEDIA':
      return {
        ...state,
        mediaItems: state.mediaItems.filter(item => item.id !== action.payload),
        error: null,
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
    setMediaList: (mediaItems: MediaItem[]) => {
      dispatch({ type: 'SET_MEDIA_LIST', payload: mediaItems });
    },
    setMedia: (media: MediaItem) => {
      dispatch({ type: 'SET_MEDIA', payload: media });
    },
    createMedia: (media: MediaItem) => {
      dispatch({ type: 'CREATE_MEDIA', payload: media });
    },
    clearMedia: () => {
      dispatch({ type: 'CLEAR_MEDIA' });
    },
    setLoading: (loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    },
    setError: (error: string) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    },
    deleteMedia: (mediaId: string) => {
      dispatch({ type: 'DELETE_MEDIA', payload: mediaId });
    },
    updateMedia: (media: MediaItem) => {
      dispatch({ type: 'UPDATE_MEDIA', payload: media });
    },
  };
}