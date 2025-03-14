# Media Library Documentation

## Sections and Markers System

### Overview
The media library supports organizing content (books, podcasts, etc.) into sections with markers. Each section can contain multiple markers for detailed note-taking and referencing.

### Sections
- **Books**: Chapters with optional titles
- **Podcasts**: Hour-based segments (planned: customizable intervals)
- **Properties**:
  - Unique ID
  - Section number
  - Optional title
  - Start position/timestamp (future: automatic for podcasts)
  - Collection of markers

### Markers
- **Purpose**: Detailed notes and quotes within sections
- **Properties**:
  - Unique ID
  - Position/timestamp
  - Order within section
  - Note content
  - Optional quote
  - Creation/update timestamps

## Planned Improvements

### Section Management
1. **Enhanced Controls**
   - Delete sections functionality
   - Drag-and-drop reordering
   - Confirmation dialogs for destructive actions
   - Start/end timestamp support for podcasts

2. **Podcast-Specific Features**
   - Timestamp linking (clickable timestamps)
   - Quick timestamp capture while listening
   - Automatic section suggestions based on silence detection
   - Customizable section intervals (30min, 15min, etc.)

### Marker Management
1. **Enhanced Controls**
   - Edit existing markers
   - Delete markers
   - Drag-and-drop reordering within sections

2. **Future Features**
   - Rich text support for notes
   - Audio snippets for podcast markers
   - Export/import markers
   - Batch operations

## Implementation Guidelines

### Adding New Features
1. Implement server-side routes first (/media/:id/sections/:sectionId)
2. Add corresponding client-side API functions
3. Update MediaContext with new operations
4. Implement UI components with proper loading/error states
5. Add confirmation dialogs for destructive actions

### Considerations
- Maintain optimistic updates for better UX
- Implement proper error handling and rollbacks
- Consider batch operations for efficiency
- Ensure proper validation on both client and server