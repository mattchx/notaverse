export type ResourceType = 'book' | 'podcast' | 'article' | 'audiobook';
export type ClipType = 'quote' | 'highlight' | 'note';

export interface BaseResource {
  type: ResourceType;
  title: string;
  author: string;
  content: string;
}

export interface Resource extends BaseResource {
  id: string;
  dateCreated: string;
  dateUpdated: string;
}

export interface CreateResourceDTO extends BaseResource {
  id?: string;
}

export interface BaseClip {
  type: ClipType;
  content: string;
}

export interface Clip extends BaseClip {
  id: string;
  resourceId: string;
  dateCreated: string;
  dateUpdated: string;
}

export interface CreateClipDTO extends BaseClip {
  resourceId: string;
  id?: string;
}

export interface BaseNote {
  content: string;
}

export interface Note extends BaseNote {
  id: string;
  resourceId: string;
  clipId: string | null;
  dateCreated: string;
  dateUpdated: string;
}

export interface CreateNoteDTO extends BaseNote {
  resourceId: string;
  clipId: string | null;
  id?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}