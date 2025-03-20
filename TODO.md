# TODO List

## ✅ Completed
- [x] fix add media item
- [x] change how new sections(chapters) are added
- [x] Add ability to delete sections and markers
- [x] Add ability to edit existing markers
- [x] Add confirmation dialogs for deletion operations

## 🔥 High Priority

### Core Note Organization (Phase 1)
- [ ] Implement basic note categorization:
  - [ ] Add note type field (concept, question, summary)
  - [ ] Update marker creation/edit forms
  - [ ] Add visual indicators for different note types
  - [ ] Filter markers by type
- [ ] Implement image upload functionality:
  - [ ] Basic image upload for notes
  - [ ] Image preview support
  - [ ] Storage optimization
- [ ] Add source links to media items
- [ ] Convert MediaLibrary view to table layout
- [ ] Improve add media form validation

### Enhanced Organization (Phase 2)
- [ ] Implement marker tagging system:
  - [ ] Basic tag support
  - [ ] Tag management UI
  - [ ] Tag filtering
- [ ] Enable marker linking:
  - [ ] Link related markers
  - [ ] Visual indication of links
  - [ ] Quick navigation between linked markers
- [ ] Enhance sections management:
  - [ ] Timestamp support for podcasts
  - [ ] Drag-and-drop reordering
  - [ ] Improved section navigation

## ⏱️ Next Up

### Learning Support Features (Phase 3)
- [ ] Enhanced search functionality:
  - [ ] Search within specific courses/media
  - [ ] Filter by note types and tags
  - [ ] Save common searches
- [ ] Resource management:
  - [ ] Add resource links to notes
  - [ ] Resource categorization
  - [ ] Quick reference view
- [ ] Study aids:
  - [ ] Export notes by section/topic
  - [ ] Generate study summaries
  - [ ] Key points highlighting

### Media-Specific Enhancements (Phase 4)
- [ ] Podcast-specific features:
  - [ ] Timestamp linking
  - [ ] Quick timestamp capture
  - [ ] Section suggestions
- [ ] Enhanced error handling
- [ ] Data validation improvements
- [ ] Better loading states

## 🎯 Future Improvements
- [ ] Knowledge organization:
  - [ ] Concept mapping
  - [ ] Topic relationships
  - [ ] Learning progress tracking
- [ ] Collaborative features:
  - [ ] Note sharing
  - [ ] Study groups
  - [ ] Discussion threads
- [ ] Advanced features:
  - [ ] AI-assisted organization
  - [ ] Spaced repetition support
  - [ ] Knowledge visualization
- [ ] Section hierarchy research:
  - [ ] Investigate nested sections for large courses
  - [ ] Consider UX implications and complexity
  - [ ] Research alternatives like:
    - Using tags for sub-grouping
    - Enhanced section naming conventions
    - Visual section grouping without database nesting
  - [ ] Evaluate based on actual user needs and usage patterns

## Development Guidelines
1. Focus on core note-taking improvements first
2. Build features incrementally
3. Test thoroughly with real course content
4. Gather user feedback early
5. Maintain simplicity in UI/UX

## Research Notes
- Nested sections: While useful for large courses, the added complexity might not justify the benefit at this stage. Current flat section structure with good organization tools (tags, search, filtering) may be sufficient. Revisit based on user feedback and actual usage patterns.
