import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Marker, ResourceType } from '../../types';
import MarkerCard from './MarkerCard';
import MarkerModal from './MarkerModal';
import EditMarkerModal from './EditMarkerModal';
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
  isOpen = false
}: SectionProps) {
  const [isAddingMarker, setIsAddingMarker] = React.useState(false);
  const [markerToEdit, setMarkerToEdit] = React.useState<Marker | null>(null);
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [sectionTitle, setSectionTitle] = React.useState(title);

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
  };

  const handleUpdateMarker = (marker: Marker) => {
    onUpdateMarker(marker);
    setMarkerToEdit(null);
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

  return (
    <Accordion 
      type="single" 
      collapsible={resourceType !== 'article'} 
      defaultValue={isOpen ? id : undefined}
      value={isOpen ? id : undefined}
      className="w-full"
    >
      <AccordionItem value={id}>
        <AccordionTrigger
          className={`px-4 hover:no-underline hover:bg-transparent ${resourceType === 'article' && 'hidden'} cursor-pointer`}
          title={resourceType === 'article' ? undefined : "Click to expand/collapse"}
          disabled={resourceType === 'article'}
        >
          <div className="flex items-center justify-between w-full">
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
                      onClick={() => {
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
                  <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
                    Edit Title
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={onDeleteSection}
                    className="text-red-600"
                  >
                    Delete Section
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className={`px-4 ${resourceType === 'article' && 'pt-4'}`}>
          {/* Display section title for articles at the top of content area */}
          {resourceType === 'article' && (
            <div className="mb-4">
              <h2 className="text-xl font-bold">{title || 'Untitled Section'}</h2>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Markers</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingMarker(true)}
              >
                Add Marker
              </Button>
            </div>

            <div className="space-y-4">
              {sortedMarkers.length > 0 ? (
                sortedMarkers.map((marker) => (
                  <MarkerCard
                    key={marker.id}
                    marker={marker}
                    resourceType={resourceType}
                    sectionNumber={number}
                    onEdit={() => setMarkerToEdit(marker)}
                    onDelete={() => handleDeleteMarker(marker.id)}
                  />
                ))
              ) : (
                <div className="text-center py-4 border border-dashed border-gray-300 rounded-md">
                  <p className="text-gray-500 mb-2">You have no markers.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingMarker(true)}
                  >
                    Click to add your first marker
                  </Button>
                </div>
              )}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <MarkerModal
        isOpen={isAddingMarker}
        onClose={() => setIsAddingMarker(false)}
        onAddMarker={handleAddMarker}
        resourceType={resourceType}
        sectionNumber={number}
        sectionId={id}
      />

      <EditMarkerModal
        isOpen={!!markerToEdit}
        onClose={() => setMarkerToEdit(null)}
        onUpdateMarker={handleUpdateMarker}
        marker={markerToEdit}
        resourceType={resourceType}
        sectionNumber={number}
        sectionId={id}
      />
    </Accordion>
  );
}