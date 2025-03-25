# TODO List

## 🔥 High Priority

### Core Note Organization (Phase 1)
- [x] Add note type field support in backend (concept, question, summary)
- [x] Add ability to delete sections and markers
- [x] Add ability to edit existing markers
- [x] Add confirmation dialogs for deletion operations
- [x] Add source links to media items
- [x] Improve add media form validation
- [ ] Update note type UI:
  - [ ] Update marker creation/edit forms to use note types
  - [ ] Add visual indicators for different note types
  - [ ] Add filters for note types in the UI
- [ ] Implement image upload functionality:
  - [ ] Basic image upload for notes
  - [ ] Image preview support
  - [ ] Storage optimization
- [ ] Convert MediaLibrary view to table layout

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
  - [ ] Study progress gamification:
    - [ ] Automatic progress tracking
    - [ ] Achievement system
    - [ ] Learning streak tracking
    - [ ] Study statistics and insights
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

## Solo Dev Project Management
Consider migrating to a streamlined GitHub Projects setup optimized for solo development:

### Simplified Structure
- Single Board: "Notaverse Development"
  - Views:
    1. Main Kanban (Default)
       - Backlog: Features/bugs to tackle
       - This Week: Current focus
       - In Progress: What you're actively working on
       - Done: Recently completed items
    2. Feature Planning
       - Table view for feature details
       - Priority field
       - Estimated complexity
       - Notes/References

### Backlog Prioritization
- Priority Levels:
  - `p0`: Critical (bugs affecting core functionality)
  - `p1`: High (key features, important improvements)
  - `p2`: Medium (nice-to-have features)
  - `p3`: Low (minor enhancements, cosmetic changes)

- Organization:
  - Sort backlog by priority labels
  - Pin critical items to top
  - Group related items using milestones
  - Add complexity estimates (Small/Medium/Large)

### Quick Capture Workflow
1. Use GitHub mobile app to quickly capture ideas/bugs
2. Convert relevant TODO.md items into issues
3. Immediately assign priority label (p0-p3)
4. Group related issues under milestones
5. Add complexity estimate

### Minimal Automation
- Issues auto-add to Backlog
- Auto-close issues when PRs merged
- Auto-generate release notes from merged PRs

### Daily Workflow
1. Start day:
   - Quick board review
   - Check for any new p0 (critical) items
   - Review "This Week" priorities

2. Task Selection:
   - Focus on highest priority items first
   - Aim to have 1 p0/p1 and 1 p2/p3 in progress
   - Move items to "This Week" based on priority and complexity

3. During day:
   - Work on selected items
   - Document any blockers or dependencies
   - Update estimates if needed

4. End day:
   - Update progress in issues
   - Review priorities for tomorrow
   - Quick scan of backlog for any priority changes

Benefits:
- Low maintenance overhead
- Clear picture of project state
- History of decisions/changes
- Easy GitHub mobile capture
