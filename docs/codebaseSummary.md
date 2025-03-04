# Codebase Summary (MVP)

## Key Components and Their Interactions

### Content Management
```
src/components/content/
├── ContentList/     # Simple list of content sections
└── ContentSection/  # Display individual content section
```

### Note System
```
src/components/notes/
├── NoteList/     # Display notes for a content section
└── NoteEditor/   # Create/edit notes with metadata
```

## Data Flow

### Content Management Flow
1. User creates new content section
2. Content appears in ContentList
3. User can select content to view/add notes

### Note Creation Flow
1. User selects content section
2. Creates note with optional metadata (timestamp/page number)
3. Note saves to NoteContext
4. UI updates to display new note

## Component Structure
```
src/
├── components/
│   ├── content/
│   │   ├── ContentList.tsx
│   │   └── ContentSection.tsx
│   └── notes/
│       ├── NoteList.tsx
│       └── NoteEditor.tsx
├── contexts/
│   ├── AppProviders.tsx
│   ├── ContentContext.tsx
│   └── NoteContext.tsx
└── types/
    └── index.ts
```

## State Management
Using Context API with two main contexts:
- ContentContext: Manages content sections
- NoteContext: Manages notes and metadata

## Next Implementation Steps
1. Simplify ContentList component
2. Create basic NoteEditor
3. Implement metadata tracking
4. Add local storage persistence

## Data Models

### Content Section
```typescript
interface ContentSection {
  id: number;
  title: string;
  type: 'podcast' | 'book';
  description?: string;
}
```

### Note
```typescript
interface Note {
  id: number;
  contentId: number;
  text: string;
  timestamp?: number;  // For podcasts
  pageNumber?: number; // For books
  quote?: string;     // Optional quote
  createdAt: number;
}
```

## Current Focus
- Implementing basic content section management
- Setting up simple note-taking interface
- Adding metadata tracking for timestamps/page numbers
- Ensuring data persistence in localStorage