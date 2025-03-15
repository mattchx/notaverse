export type MediaType = 'podcast' | 'book'

export interface MediaItem {
  id: string
  name: string
  author?: string
  sourceUrl?: string
  sections: Section[]
  type: MediaType
}

export interface Section {
  id: string
  title: string     // Changed from name
  number: number    // Changed from order
  start?: string    // page number or timestamp
  markers: Marker[]
}

// page number or timestamp
export interface Marker {
  id: string
  position: string
  order: number // Position in the sequence of markers within a section
  quote?: string // (optional) lines from a book or snippet of audio
  note: string // thought or comment
  dateCreated?: string
  dateUpdated?: string
}

// Helper type for active content state
export interface ContentState {
  activeContent: MediaItem | null;
  activeSection: Section | null;
  isLoading: boolean;
  error: string | null;
}

// Context action types
export type ContentAction =
  | { type: 'SET_CONTENT'; payload: MediaItem }
  | { type: 'SET_SECTION'; payload: Section }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_CONTENT' };