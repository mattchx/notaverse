import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Marker, ResourceType } from '../../types';
import MarkerCard from './MarkerCard';
import MarkerModal from './MarkerModal';
import EditMarkerModal from './EditMarkerModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface SectionProps {
  id: string;
  name: string;
  orderNum: number;
  markers: Marker[];
  resourceType: ResourceType;
  onAddMarker: (marker: Omit<Marker, 'id'>) => void;
  onUpdateMarker: (marker: Marker) => void;
  onDeleteMarker: (markerId: string) => void;
  onUpdateName?: (name: string) => void;
  onDeleteSection?: () => void;
}

export default function Section({
  id,
  name,
  orderNum,
  markers,
  resourceType,
  onAddMarker,
  onUpdateMarker,
  onDeleteMarker,
  onUpdateName,
  onDeleteSection
}: SectionProps) {
  const [isAddingMarker, setIsAddingMarker] = React.useState(false);
  const [markerToEdit, setMarkerToEdit] = React.useState<Marker | null>(null);
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [sectionName, setSectionName] = React.useState(name);

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

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateName && sectionName.trim()) {
      onUpdateName(sectionName);
      setIsEditingName(false);
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={id}>
        <AccordionTrigger
          className={`px-4 hover:no-underline hover:bg-transparent ${resourceType === 'article' && 'hidden'} cursor-pointer`}
          title={resourceType === 'article' ? undefined : "Click to expand/collapse"}
          disabled={resourceType === 'article'}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <form onSubmit={handleNameSubmit} onClick={(e) => e.stopPropagation()}>
                  <Input
                    value={sectionName}
                    onChange={(e) => setSectionName(e.target.value)}
                    className="w-64"
                    autoFocus
                  />
                  <Button type="submit" size="sm" className="ml-2">Save</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="ml-2"
                    onClick={() => {
                      setSectionName(name);
                      setIsEditingName(false);
                    }}
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                <>
                  <span className="font-medium">{name}</span>
                  {resourceType === 'podcast' && (
                    <span className="text-sm text-gray-500">Hour {orderNum}</span>
                  )}
                </>
              )}
            </div>
            
            {!isEditingName && onUpdateName && onDeleteSection && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditingName(true)}>
                    Edit Name
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
              {sortedMarkers.map((marker) => (
                <MarkerCard
                  key={marker.id}
                  marker={marker}
                  resourceType={resourceType}
                  sectionNumber={orderNum}
                  onEdit={() => setMarkerToEdit(marker)}
                  onDelete={() => handleDeleteMarker(marker.id)}
                />
              ))}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <MarkerModal
        isOpen={isAddingMarker}
        onClose={() => setIsAddingMarker(false)}
        onAddMarker={handleAddMarker}
        resourceType={resourceType}
        sectionNumber={orderNum}
      />

      <EditMarkerModal
        isOpen={!!markerToEdit}
        onClose={() => setMarkerToEdit(null)}
        onUpdateMarker={handleUpdateMarker}
        marker={markerToEdit!}
        resourceType={resourceType}
        sectionNumber={orderNum}
      />
    </Accordion>
  );
}