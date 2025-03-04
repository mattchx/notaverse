# Content Viewer System

## Overview
The content viewer system provides a unified interface for viewing and interacting with different types of content (audio, articles, PDFs). Each content type has its own specialized viewer component with format-specific features.

## Components Structure
```
content/
├── ContentViewer.tsx         # Main viewer component
├── ContentLibrary.tsx        # Content listing and navigation
└── quotes/
    └── ArticleQuoteExtractor.tsx  # Text selection and quote creation
```

## Features

### Content Management
- Unified viewer interface for multiple content types
- Format-specific rendering and controls
- Section-based content organization
- Content navigation through library view

### Quote System
- Text selection-based quote creation for articles
- Keyboard shortcut support (⌘Q/Ctrl+Q)
- Section-aware quote extraction
- Real-time quote saving to context

## Content Types

### Articles
- HTML content rendering
- Text selection for quotes
- Section-based navigation
- Quote extraction with section tracking

### Audio (Podcasts/Audiobooks)
- Native audio player controls
- Section markers with timestamps
- (Planned) Timestamp-based quote extraction

### PDF (In Progress)
- Basic PDF file rendering
- Section navigation by pages
- (Planned) Text selection and quote extraction

## State Management
- Uses Context API for state management
- Separate contexts for content, quotes, and notes
- Real-time state updates
- Persistent storage (planned)

## Usage Example

```typescript
// Creating a quote from article text
const handleQuoteCreate = (selection: Selection) => {
  if (!selection) return;
  
  const quote = {
    text: selection.toString(),
    sectionId: getCurrentSectionId(),
    contentId: activeContent.id,
    createdAt: Date.now()
  };
  
  addQuote(quote);
};
```

## Next Steps
1. Implement timestamp-based quote extraction for audio content
2. Add PDF viewer integration with react-pdf
3. Create quote management interface
4. Add persistent storage for quotes