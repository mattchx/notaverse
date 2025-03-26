export interface MediaItem {
  id: string;
  userId: string;
  name: string;
  type: 'book' | 'podcast' | 'article' | 'course';
  author?: string;
  sourceUrl?: string;
  description?: string;
  sections: Section[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Section {
  id: string;
  mediaId: string;
  title: string;
  number: number;
  markers: Marker[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Marker {
  id: string;
  sectionId: string;
  userId: string;
  position: string;
  order: number;      // For API responses
  orderNum: number;   // For database
  quote?: string;
  note: string;
  type: 'general' | 'concept' | 'question' | 'summary';
  dateCreated?: string;  // For API responses
  dateUpdated?: string;  // For API responses
  createdAt: Date;    // For database
  updatedAt: Date;    // For database
}