export interface MediaItem {
  id: string;
  name: string;
  type: 'book' | 'podcast';
  author?: string;
  sourceUrl?: string;
  sections: Section[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Section {
  id: string;
  mediaId: string;
  title: string;      // Changed from name to title
  number: number;     // Changed from order to number
  markers: Marker[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Marker {
  id: string;
  sectionId: string;
  position: string;
  order: number;
  quote?: string;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}