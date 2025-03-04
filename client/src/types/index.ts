export interface ContentSection {
  id: number;
  title: string;
  type: 'podcast' | 'book';
  description?: string;
}

export interface Note {
  id: number;
  contentId: number;
  text: string;
  timestamp?: number;  // For podcasts
  pageNumber?: number; // For books
  quote?: string;     // Optional quote
  createdAt: number;
}