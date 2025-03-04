# Technology Stack & Architecture Decisions (MVP)

## Frontend Core Technologies

### React.js
- **Version**: 18+
- **Justification**: Simple component-based architecture ideal for MVP
- **Key Features Used**:
  - Hooks for state management (useState, useEffect)
  - Context API for basic state management

### TypeScript
- **Version**: 5.x
- **Justification**: Type safety for better development experience
- **Configuration**: Basic type checking enabled

## State Management

### Context API
- **Justification**: 
  - Simple built-in solution sufficient for MVP needs
  - No need for complex state management
- **Context Structure**:
  - ContentContext: Manages content sections
  - NoteContext: Manages notes and metadata

## Styling

### Tailwind CSS
- **Version**: 3.x
- **Justification**: 
  - Quick styling implementation
  - Built-in responsive design
- **Usage**: Basic styling needs only

## Storage

### Local Storage
- **Purpose**: Simple data persistence for MVP
- **Scope**: Store content sections and notes

## Build Tools

### Vite
- **Purpose**: Fast development server and build tool
- **Features**:
  - Quick development setup
  - TypeScript support

## Simplified Data Models

### Content
```typescript
interface Content {
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