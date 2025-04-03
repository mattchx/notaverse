import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Marker, ResourceType } from '../../types';
import MarkerCard from './MarkerCard';
import MarkerModal from './MarkerModal';
import EditMarkerModal from './EditMarkerModal';
import InlineMarkerEditor from './InlineMarkerEditor';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

// Function to generate section title based on resource type
const getSectionTitle = (title: string, number: number | undefined, resourceType: ResourceType): string | null => {
  // number is the sequential section number
  const sectionNumber = number ?? 1;
  
  switch (resourceType) {
    case 'book':
      return `Chapter ${sectionNumber}: ${title}`;
    case 'podcast':
      return `Hour ${sectionNumber}: ${title}`;
    case 'course':
      return `Module ${sectionNumber}: ${title}`;
    case 'article':
      // Articles don't need section titles
      return null;
    default:
      return title;
  }
};

// Function to get the prefix for a section title (e.g., "Chapter 1: ")
const getSectionPrefix = (number: number | undefined, resourceType: ResourceType): string => {
  // number is the sequential section number
  const sectionNumber = number ?? 1;
  
  switch (resourceType) {
    case 'book':
      return `Chapter ${sectionNumber}: `;
    case 'podcast':
      return `Hour ${sectionNumber}: `;
    case 'course':
      return `Module ${sectionNumber}: `;
    default:
      return '';
  }
};

interface SectionProps {
  id: string;
  title: string;
  number: number;
  markers: Marker[];
  resourceType: ResourceType;
  onAddMarker: (marker: Omit<Marker, 'id'>) => void;
  onUpdateMarker: (marker: Marker) => void;
  onDeleteMarker: (markerId: string) => void;
  onUpdateTitle?: (title: string) => void;
  onDeleteSection?: () => void;
  isOpen?: boolean;
  onToggle?: (id: string, isOpen: boolean) => void;
}

export default function Section({
  id,
  title,
  number,
  markers,
  resourceType,
  onAddMarker,
  onUpdateMarker,
  onDeleteMarker,
  onUpdateTitle,
  onDeleteSection,
  isOpen = false,
  onToggle
}: SectionProps) {
  const [isAddingMarker, setIsAddingMarker] = React.useState(false);
  const [markerToEdit, setMarkerToEdit] = React.useState<Marker | null>(null);
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [sectionTitle, setSectionTitle] = React.useState(title);
  const [internalOpen, setInternalOpen] = React.useState(isOpen);
  
  // New state for inline editing
  const [isInlineAddingMarker, setIsInlineAddingMarker] = React.useState(false);
  const [inlineMarkerToEdit, setInlineMarkerToEdit] = React.useState<Marker | null>(null);
  const [useInlineEditing, setUseInlineEditing] = React.useState(true);
  
  // Sync internal state with prop
  React.useEffect(() => {
    setInternalOpen(isOpen);
  }, [isOpen]);

  // Get section title based on resource type
  const formattedTitle = getSectionTitle(title, number, resourceType);

  const sortedMarkers = React.useMemo(() => {
    return [...markers].sort((a, b) => {
      if (resourceType === 'book' || resourceType === 'article') {
        // For books and articles, sort by page number
        const aNum = parseInt(a.position);
        const bNum = parseInt(b.position);
        return aNum - bNum;
      } else {
        // For audio/video, sort by timestamp
        return a.position.localeCompare(b.position);
      }
    });
  }, [markers, resourceType]);

  const handleAddMarker = (marker: Omit<Marker, 'id'>) => {
    onAddMarker({
      ...marker,
      sectionId: id
    });
    setIsAddingMarker(false);
    setIsInlineAddingMarker(false);
  };

  const handleUpdateMarker = (marker: Marker) => {
    onUpdateMarker(marker);
    setMarkerToEdit(null);
    setInlineMarkerToEdit(null);
  };
  
  // Create a handler that can handle both Marker and Omit<Marker, 'id'>
  const handleSaveMarker = (marker: Marker | Omit<Marker, 'id'>) => {
    if ('id' in marker) {
      // It's a Marker, so update
      handleUpdateMarker(marker);
    } else {
      // It's a new marker
      handleAddMarker(marker);
    }
  };

  const handleDeleteMarker = (markerId: string) => {
    onDeleteMarker(markerId);
  };

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateTitle && sectionTitle.trim()) {
      onUpdateTitle(sectionTitle);
      setIsEditingTitle(false);
    }
  };

  const handleToggle = () => {
    if (resourceType === 'article') return;
    
    const newState = !internalOpen;
    setInternalOpen(newState);
    
    // Notify parent component about the toggle
    if (onToggle) {
      onToggle(id, newState);
    }
  };

  return (
    <div className="w-full border rounded-md mb-2">
      <div 
        className={`px-4 py-3 flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 ${resourceType === 'article' && 'hidden'}`}
        onClick={handleToggle}
      >
        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                {/* Display fixed section prefix */}
                {resourceType !== 'article' && (
                  <span className="font-medium">{getSectionPrefix(number, resourceType)}</span>
                )}
                <Input
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  className="w-64"
                  autoFocus
                />
                <Button type="submit" size="sm">Save</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSectionTitle(title);
                    setIsEditingTitle(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <>
              <span className="font-medium">
                {formattedTitle || title || 'Untitled Section'}
              </span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {!isEditingTitle && onUpdateTitle && onDeleteSection && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                  <span className="sr-only">Actions</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingTitle(true);
                }}>
                  Edit Title
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setUseInlineEditing(!useInlineEditing);
                  }}
                >
                  {useInlineEditing ? 'Use Modal Editing' : 'Use Inline Editing'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSection();
                  }}
                  className="text-red-600"
                >
                  Delete Section
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Chevron indicator */}
          <div className={`transition-transform duration-200 ${internalOpen ? 'transform rotate-180' : ''}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Content Area */}
      {(internalOpen || resourceType === 'article') && (
        <div className={`px-4 py-4 ${resourceType === 'article' && 'pt-4'}`}>
          {/* Remove section title display for articles */}
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Markers</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (useInlineEditing) {
                      setIsInlineAddingMarker(true);
                    } else {
                      setIsAddingMarker(true);
                    }
                  }}
                >
                  Add Marker
                </Button>
              </div>
            </div>

            {/* Inline add marker editor */}
            {isInlineAddingMarker && (
              <InlineMarkerEditor
                resourceType={resourceType}
                sectionId={id}
                onSave={handleSaveMarker}
                onCancel={() => setIsInlineAddingMarker(false)}
              />
            )}

            <div className="space-y-4">
              {sortedMarkers.length > 0 ? (
                sortedMarkers.map((marker) => (
                  <React.Fragment key={marker.id}>
                    {inlineMarkerToEdit && inlineMarkerToEdit.id === marker.id ? (
                      <InlineMarkerEditor
                        marker={marker}
                        resourceType={resourceType}
                        sectionId={id}
                        onSave={handleSaveMarker}
                        onCancel={() => setInlineMarkerToEdit(null)}
                      />
                    ) : (
                      <MarkerCard
                        marker={marker}
                        resourceType={resourceType}
                        sectionNumber={number}
                        onEdit={() => {
                          if (useInlineEditing) {
                            setInlineMarkerToEdit(marker);
                          } else {
                            setMarkerToEdit(marker);
                          }
                        }}
                        onDelete={() => handleDeleteMarker(marker.id)}
                      />
                    )}
                  </React.Fragment>
                ))
              ) : (
                <div className="text-center py-4 border border-dashed border-gray-300 rounded-md">
                  <p className="text-gray-500 mb-2">You have no markers.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (useInlineEditing) {
                        setIsInlineAddingMarker(true);
                      } else {
                        setIsAddingMarker(true);
                      }
                    }}
                  >
                    Click to add your first marker
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Keep existing modals as fallback */}
      <MarkerModal
        isOpen={isAddingMarker}
        onClose={() => setIsAddingMarker(false)}
        onAddMarker={handleSaveMarker}
        resourceType={resourceType}
        sectionNumber={number}
        sectionId={id}
      />

      <EditMarkerModal
        isOpen={!!markerToEdit}
        onClose={() => setMarkerToEdit(null)}
        onUpdateMarker={handleSaveMarker}
        marker={markerToEdit}
        resourceType={resourceType}
        sectionNumber={number}
        sectionId={id}
      />
    </div>
  );
}