export interface Section {
  id: number;
  name: string;
  start?: number; // For audio content
  page?: number;  // For PDF content
  content?: string; // For article content
}

export type ContentType = 'podcast' | 'audiobook' | 'article' | 'pdf';

export interface Content {
  id: number;
  type: ContentType;
  title: string;
  url?: string;
  content?: string;
  sections: Section[];
}

export interface Quote {
  id: number;
  contentId: number;
  text: string;
  timestamp?: number; // Unix timestamp for audio quotes
  page?: number;      // For PDF quotes
  sectionId: number;
  createdAt: number;  // Unix timestamp
}

export interface Note {
  id: number;
  contentId: number;
  sectionId: number;
  text: string;
  createdAt: number;  // Unix timestamp
}

// Helper type for active content state
export interface ContentState {
  activeContent: Content | null;
  activeSection: Section | null;
  isLoading: boolean;
  error: string | null;
}

// Context action types
export type ContentAction =
  | { type: 'SET_CONTENT'; payload: Content }
  | { type: 'SET_SECTION'; payload: Section }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_CONTENT' };