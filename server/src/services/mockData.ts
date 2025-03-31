import { Resource, Section, Marker, Note, CreateResourceDTO, CreateMarkerDTO, CreateNoteDTO } from '../types/resource.js';

const resources: Resource[] = [
  {
    id: "r1",
    userId: "u1",
    name: "The Pragmatic Programmer",
    type: "book",
    author: "Dave Thomas, Andy Hunt",
    sections: [],
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-02-20")
  },
  {
    id: "r2",
    userId: "u1",
    name: "The Future of Web Development",
    type: "article",
    author: "Tech Magazine",
    sections: [],
    createdAt: new Date("2024-02-21"),
    updatedAt: new Date("2024-02-21")
  }
];

const markers: Marker[] = [
  {
    id: "m1",
    sectionId: "s1",
    userId: "u1",
    position: "p1",
    order: 1,
    orderNum: 1,
    note: "Great reminder about accepting imperfection in software development",
    type: "general",
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-02-20")
  },
  {
    id: "m2",
    sectionId: "s1",
    userId: "u1",
    position: "p2",
    order: 2,
    orderNum: 2,
    note: "Core principle of software development that helps reduce maintenance",
    type: "concept",
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-02-20")
  }
];

const notes: Note[] = [
  {
    id: "n1",
    resourceId: "r1",
    userId: "u1",
    content: "Need to research more about the latest web development trends mentioned",
    createdAt: new Date("2024-02-21"),
    updatedAt: new Date("2024-02-21")
  }
];

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export class MockDataService {
  private resources: Resource[] = resources;
  private markers: Marker[] = markers;
  private notes: Note[] = notes;

  // Resource methods
  async getResources(): Promise<Resource[]> {
    return [...this.resources];
  }

  async getResourceById(id: string): Promise<Resource | undefined> {
    return this.resources.find(r => r.id === id);
  }

  async createResource(data: CreateResourceDTO): Promise<Resource> {
    const now = new Date();
    const sections: Section[] = data.sections.map(sectionData => ({
      ...sectionData,
      id: sectionData.id || generateId(),
      markers: [],
      createdAt: now,
      updatedAt: now
    }));

    const newResource: Resource = {
      ...data,
      id: data.id || generateId(),
      sections,
      createdAt: now,
      updatedAt: now,
    };
    this.resources.push(newResource);
    return newResource;
  }

  // Marker methods
  async getMarkers(): Promise<Marker[]> {
    return [...this.markers];
  }

  async getMarkersBySectionId(sectionId: string): Promise<Marker[]> {
    return this.markers.filter(m => m.sectionId === sectionId);
  }

  async getMarkerById(id: string): Promise<Marker | undefined> {
    return this.markers.find(m => m.id === id);
  }

  async createMarker(data: CreateMarkerDTO): Promise<Marker> {
    const now = new Date();
    const newMarker: Marker = {
      ...data,
      id: data.id || generateId(),
      orderNum: data.order, // Map order to orderNum
      createdAt: now,
      updatedAt: now,
      dateCreated: now.toISOString(),
      dateUpdated: now.toISOString(),
    };
    this.markers.push(newMarker);
    return newMarker;
  }

  // Note methods
  async getNotes(): Promise<Note[]> {
    return [...this.notes];
  }

  async getNotesByResourceId(resourceId: string): Promise<Note[]> {
    return this.notes.filter(n => n.resourceId === resourceId);
  }

  async getNotesByMarkerId(markerId: string): Promise<Note[]> {
    return this.notes.filter(n => n.markerId === markerId);
  }

  async getNoteById(id: string): Promise<Note | undefined> {
    return this.notes.find(n => n.id === id);
  }

  async createNote(data: CreateNoteDTO): Promise<Note> {
    const now = new Date();
    const newNote: Note = {
      ...data,
      id: data.id || generateId(),
      createdAt: now,
      updatedAt: now,
    };
    this.notes.push(newNote);
    return newNote;
  }

  // Section methods
  async getSectionById(id: string): Promise<Section | undefined> {
    for (const resource of this.resources) {
      const section = resource.sections.find(s => s.id === id);
      if (section) return section;
    }
    return undefined;
  }
}

export const mockDataService = new MockDataService();