export interface Resource {
  id: string;
  userId: string;
  name: string;
  type: 'book' | 'podcast' | 'article' | 'course';
  author?: string;
  sourceUrl?: string;
  description?: string;
  isPublic?: boolean;
  sections: Section[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Section {
  id: string;
  resourceId: string;
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

export interface Note {
  id: string;
  resourceId: string;
  userId: string;
  content: string;
  markerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  markerId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name?: string;
    avatarUrl?: string;
  };
}

export interface CreateResourceDTO {
  id?: string;
  userId: string;
  name: string;
  type: 'book' | 'podcast' | 'article' | 'course';
  author?: string;
  sourceUrl?: string;
  description?: string;
  isPublic?: boolean;
  sections: CreateSectionDTO[];
}

export interface CreateSectionDTO {
  id?: string;
  resourceId: string;
  title: string;
  number: number;
  markers?: CreateMarkerDTO[];
}

export interface CreateMarkerDTO {
  id?: string;
  sectionId: string;
  userId: string;
  position: string;
  order: number;
  quote?: string;
  note: string;
  type: 'general' | 'concept' | 'question' | 'summary';
}

export interface CreateNoteDTO {
  id?: string;
  resourceId: string;
  userId: string;
  content: string;
  markerId?: string;
}

export interface CreateCommentDTO {
  markerId: string;
  content: string;
}