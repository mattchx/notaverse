export type ResourceType = 'podcast' | 'book' | 'article' | 'course'

export type NoteType = 'general' | 'concept' | 'question' | 'summary'

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  author?: string;
  sourceUrl?: string;
  userId: string;
  isPublic?: boolean;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  resourceId: string;
  title: string;
  number: number;
  markers: Marker[];
  createdAt: string;
  updatedAt: string;
}

export interface Marker {
  id: string;
  sectionId: string;
  userId?: string;
  position: string;
  orderNum: number;
  quote: string;
  note: string;
  type: MarkerType;
  createdAt: string;
  updatedAt: string;
}

export type MarkerType = 'concept' | 'question' | 'summary';

// Helper type for active content state
export interface ContentState {
  activeContent: Resource | null;
  activeSection: Section | null;
  isLoading: boolean;
  error: string | null;
}

// Context action types
export type ContentAction =
  | { type: 'SET_CONTENT'; payload: Resource }
  | { type: 'SET_SECTION'; payload: Section }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_CONTENT' };