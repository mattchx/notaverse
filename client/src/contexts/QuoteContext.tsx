import React, { createContext, useContext, useReducer } from 'react';
import { Quote } from '../types/content';

interface QuoteState {
  quotes: Quote[];
  selectedQuote: Quote | null;
  isLoading: boolean;
  error: string | null;
}

type QuoteAction =
  | { type: 'ADD_QUOTE'; payload: Quote }
  | { type: 'UPDATE_QUOTE'; payload: Quote }
  | { type: 'DELETE_QUOTE'; payload: number }
  | { type: 'SET_SELECTED_QUOTE'; payload: Quote | null }
  | { type: 'SET_QUOTES'; payload: Quote[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string };

const initialState: QuoteState = {
  quotes: [],
  selectedQuote: null,
  isLoading: false,
  error: null,
};

const QuoteContext = createContext<{
  state: QuoteState;
  dispatch: React.Dispatch<QuoteAction>;
} | undefined>(undefined);

function quoteReducer(state: QuoteState, action: QuoteAction): QuoteState {
  switch (action.type) {
    case 'ADD_QUOTE':
      return {
        ...state,
        quotes: [...state.quotes, action.payload],
        error: null,
      };
    case 'UPDATE_QUOTE':
      return {
        ...state,
        quotes: state.quotes.map((quote) =>
          quote.id === action.payload.id ? action.payload : quote
        ),
        error: null,
      };
    case 'DELETE_QUOTE':
      return {
        ...state,
        quotes: state.quotes.filter((quote) => quote.id !== action.payload),
        selectedQuote:
          state.selectedQuote?.id === action.payload ? null : state.selectedQuote,
        error: null,
      };
    case 'SET_SELECTED_QUOTE':
      return {
        ...state,
        selectedQuote: action.payload,
      };
    case 'SET_QUOTES':
      return {
        ...state,
        quotes: action.payload,
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

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(quoteReducer, initialState);

  return (
    <QuoteContext.Provider value={{ state, dispatch }}>
      {children}
    </QuoteContext.Provider>
  );
}

export function useQuotes() {
  const context = useContext(QuoteContext);
  if (context === undefined) {
    throw new Error('useQuotes must be used within a QuoteProvider');
  }
  return context;
}

// Helper hooks and functions
export function useQuoteOperations() {
  const { dispatch } = useQuotes();

  return {
    addQuote: (quote: Quote) => {
      dispatch({ type: 'ADD_QUOTE', payload: quote });
    },
    updateQuote: (quote: Quote) => {
      dispatch({ type: 'UPDATE_QUOTE', payload: quote });
    },
    deleteQuote: (quoteId: number) => {
      dispatch({ type: 'DELETE_QUOTE', payload: quoteId });
    },
    setSelectedQuote: (quote: Quote | null) => {
      dispatch({ type: 'SET_SELECTED_QUOTE', payload: quote });
    },
    setQuotes: (quotes: Quote[]) => {
      dispatch({ type: 'SET_QUOTES', payload: quotes });
    },
    setLoading: (loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    },
    setError: (error: string) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    },
  };
}

// Utility hooks for common quote operations
export function useQuotesByContent(contentId: number) {
  const { state } = useQuotes();
  return state.quotes.filter((quote) => quote.contentId === contentId);
}

export function useQuotesBySection(sectionId: number) {
  const { state } = useQuotes();
  return state.quotes.filter((quote) => quote.sectionId === sectionId);
}

export function useSelectedQuote() {
  const { state } = useQuotes();
  return state.selectedQuote;
}