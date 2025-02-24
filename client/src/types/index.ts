export type ResourceType = 'book' | 'podcast' | 'article' | 'audiobook';
export type ClipType = 'quote' | 'highlight' | 'note';

export interface Resource {
  id: string;
  type: ResourceType;
  dateCreated: string;
  dateUpdated: string;
  title: string;
  author: string;
  content: string;
  // todo: update to support audio content
}

export interface Clip {
  id: string;
  resourceId: string;
  type: ClipType;
  dateCreated: string;
  dateUpdated: string;
  content: string;
}

export interface Note {
  id: string;
  resourceId: string;
  clipId: string | null;
  dateCreated: string;
  dateUpdated: string;
  content: string;
}