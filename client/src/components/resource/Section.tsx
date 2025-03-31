import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Button } from '../ui/button';
import { Marker, ResourceType } from '../../types';
import MarkerCard from './MarkerCard';
import MarkerModal from './MarkerModal';
import EditMarkerModal from './EditMarkerModal';

interface SectionProps {
  id: string;
  name: string;
  orderNum: number;
  markers: Marker[];
  resourceType: ResourceType;
  onAddMarker: (marker: Omit<Marker, 'id'>) => void;
  onUpdateMarker: (marker: Marker) => void;
  onDeleteMarker: (markerId: string) => void;
}

export default function Section({
  id,
  name,
  orderNum,
  markers,
  resourceType,
  onAddMarker,
  onUpdateMarker,
  onDeleteMarker
}: SectionProps) {
  const [isAddingMarker, setIsAddingMarker] = React.useState(false);
  const [markerToEdit, setMarkerToEdit] = React.useState<Marker | null>(null);

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

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={id}>
        <AccordionTrigger
          className={`px-4 hover:no-underline hover:bg-transparent ${resourceType === 'article' && 'hidden'} cursor-pointer`}
          title={resourceType === 'article' ? undefined : "Click to expand/collapse"}
          disabled={resourceType === 'article'}
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">{name}</span>
            {resourceType === 'podcast' && (
              <span className="text-sm text-gray-500">Hour {orderNum}</span>
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