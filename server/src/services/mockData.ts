import { Resource, Clip, Note, CreateResourceDTO, CreateClipDTO, CreateNoteDTO } from '../types/index.js';

const resources: Resource[] = [
  {
    id: "r1",
    type: "book",
    title: "The Pragmatic Programmer",
    author: "Dave Thomas, Andy Hunt",
    content: "The Pragmatic Programmer is a software development book that explores the core principles of writing clean, maintainable code...",
    dateCreated: new Date("2024-02-20").toISOString(),
    dateUpdated: new Date("2024-02-20").toISOString()
  },
  {
    id: "r2",
    type: "article",
    title: "The Future of Web Development",
    author: "Tech Magazine",
    content: "Web development is evolving rapidly with new frameworks and tools. In this article, we explore the latest trends...",
    dateCreated: new Date("2024-02-21").toISOString(),
    dateUpdated: new Date("2024-02-21").toISOString()
  },
  {
    id: "r3",
    type: "podcast",
    title: "Syntax.fm - TypeScript Tips",
    author: "Wes Bos & Scott Tolinski",
    content: "In this episode, we dive deep into TypeScript best practices and tips that will make you a more effective developer...",
    dateCreated: new Date("2024-02-22").toISOString(),
    dateUpdated: new Date("2024-02-22").toISOString()
  }
];

const clips: Clip[] = [
  {
    id: "c1",
    resourceId: "r1",
    type: "quote",
    content: "You can't write perfect software. Did that hurt? It shouldn't. Accept it as an axiom of life.",
    dateCreated: new Date("2024-02-20").toISOString(),
    dateUpdated: new Date("2024-02-20").toISOString()
  },
  {
    id: "c2",
    resourceId: "r1",
    type: "highlight",
    content: "DRY - Don't Repeat Yourself",
    dateCreated: new Date("2024-02-20").toISOString(),
    dateUpdated: new Date("2024-02-20").toISOString()
  },
  {
    id: "c3",
    resourceId: "r2",
    type: "quote",
    content: "Web development is evolving rapidly with new frameworks and tools.",
    dateCreated: new Date("2024-02-21").toISOString(),
    dateUpdated: new Date("2024-02-21").toISOString()
  }
];

const notes: Note[] = [
  {
    id: "n1",
    resourceId: "r1",
    clipId: "c1",
    content: "Great reminder about accepting imperfection in software development",
    dateCreated: new Date("2024-02-20").toISOString(),
    dateUpdated: new Date("2024-02-20").toISOString()
  },
  {
    id: "n2",
    resourceId: "r1",
    clipId: "c2",
    content: "Core principle of software development that helps reduce maintenance",
    dateCreated: new Date("2024-02-20").toISOString(),
    dateUpdated: new Date("2024-02-20").toISOString()
  },
  {
    id: "n3",
    resourceId: "r2",
    clipId: null,
    content: "Need to research more about the latest web development trends mentioned",
    dateCreated: new Date("2024-02-21").toISOString(),
    dateUpdated: new Date("2024-02-21").toISOString()
  }
];

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export class MockDataService {
  private resources: Resource[] = resources;
  private clips: Clip[] = clips;
  private notes: Note[] = notes;

  // Resource methods
  async getResources(): Promise<Resource[]> {
    return [...this.resources];
  }

  async getResourceById(id: string): Promise<Resource | undefined> {
    return this.resources.find(r => r.id === id);
  }

  async createResource(data: CreateResourceDTO): Promise<Resource> {
    const now = new Date().toISOString();
    const newResource: Resource = {
      ...data,
      id: data.id || generateId(),
      dateCreated: now,
      dateUpdated: now,
    };
    this.resources.push(newResource);
    return newResource;
  }

  // Clip methods
  async getClips(): Promise<Clip[]> {
    return [...this.clips];
  }

  async getClipsByResourceId(resourceId: string): Promise<Clip[]> {
    return this.clips.filter(c => c.resourceId === resourceId);
  }

  async getClipById(id: string): Promise<Clip | undefined> {
    return this.clips.find(c => c.id === id);
  }

  async createClip(data: CreateClipDTO): Promise<Clip> {
    const now = new Date().toISOString();
    const newClip: Clip = {
      ...data,
      id: data.id || generateId(),
      dateCreated: now,
      dateUpdated: now,
    };
    this.clips.push(newClip);
    return newClip;
  }

  // Note methods
  async getNotes(): Promise<Note[]> {
    return [...this.notes];
  }

  async getNotesByResourceId(resourceId: string): Promise<Note[]> {
    return this.notes.filter(n => n.resourceId === resourceId);
  }

  async getNotesByClipId(clipId: string): Promise<Note[]> {
    return this.notes.filter(n => n.clipId === clipId);
  }

  async getNoteById(id: string): Promise<Note | undefined> {
    return this.notes.find(n => n.id === id);
  }

  async createNote(data: CreateNoteDTO): Promise<Note> {
    const now = new Date().toISOString();
    const newNote: Note = {
      ...data,
      id: data.id || generateId(),
      dateCreated: now,
      dateUpdated: now,
    };
    this.notes.push(newNote);
    return newNote;
  }
}

export const mockDataService = new MockDataService();