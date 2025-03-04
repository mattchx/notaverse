# Codebase Summary

## Key Components and Their Interactions

### Content Management
```
ContentViewer/
├── AudioPlayer/       # Handles podcasts and audiobooks
├── ArticleViewer/    # Renders article content with quote extraction
├── PDFViewer/        # Manages PDF display (in progress)
└── SectionNavigator/ # Common section navigation
```

### Quote System
```
QuoteManager/
├── ArticleQuoteExtractor/ # Implemented - text selection quotes
├── AudioQuoteExtractor/   # Planned - timestamp quotes
├── QuoteList/            # Planned - quote display
└── QuoteEditor/          # Planned - edit/delete functionality
```

### Note Taking
```
NoteSystem/
├── NoteEditor/       # Planned - create/edit notes
├── NoteList/        # Planned - display notes by section
└── NoteSummary/     # Planned - generate summaries
```

## Data Flow

### Content Loading Flow
1. User selects content in ContentLibrary
2. ContentViewer loads content data
3. Format-specific viewer renders
4. Quote extraction system activates

### Quote Creation Flow
1. User selects content (text/timestamp)
2. QuoteExtractor processes selection
3. Quote saves to QuoteContext
4. UI updates to reflect new quote

## External Dependencies

### Core Dependencies
- react: UI framework
- typescript: Type checking
- tailwindcss: Styling

### Development Dependencies
- vite: Build tool
- jest: Testing (planned)

## Recent Significant Changes
1. Implemented Context API state management
2. Created base content viewer components
3. Added article quote extraction system
4. Set up project documentation structure

## Component Structure
```
src/
├── components/
│   └── content/
│       ├── ContentViewer.tsx
│       ├── ContentLibrary.tsx
│       └── quotes/
│           └── ArticleQuoteExtractor.tsx
├── contexts/
│   ├── AppProviders.tsx
│   ├── ContentContext.tsx
│   ├── QuoteContext.tsx
│   └── NoteContext
├── types/
│   └── content.ts
└── utils/           # Planned helper functions
```

## Data Models

### Content Interface
```typescript
interface Content {
  id: number;
  type: 'podcast' | 'audiobook' | 'article' | 'pdf';
  title: string;
  url?: string;
  content?: string;
  sections: Section[];
}
```

### Quote Interface
```typescript
interface Quote {
  id: number;
  contentId: number;
  text: string;
  timestamp?: number;  // For audio content
  page?: number;       // For PDF content
  sectionId: number;
  createdAt: number;   // Unix timestamp
}
```

### Note Interface
```typescript
interface Note {
  id: number;
  contentId: number;
  sectionId: number;
  text: string;
  createdAt: number;  // Unix timestamp
}
```

## State Management
Using Context API with specific contexts:
- ContentContext: Manages active content
- QuoteContext: Handles quotes
- NoteContext: Manages notes
- AppProviders: Combines all contexts

## Next Implementation Steps
1. Audio timestamp-based quote extraction
2. PDF viewer integration
3. Quote display and management UI
4. Note creation interface
5. Local storage persistence

## Performance Considerations
- Lazy loading for PDF viewer
- Memoization for content rendering
- Efficient state updates

## Testing Strategy (Planned)
- Unit tests for utilities
- Component tests for core features
- Integration tests for workflows

## Accessibility Features (Planned)
- ARIA labels
- Keyboard navigation
- Screen reader support

## Current Focus
- Implementing timestamp-based quote extraction for audio content
- Setting up quote management interface
- Adding persistent storage