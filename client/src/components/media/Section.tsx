import React from 'react';
import { Section as SectionType, Marker } from '../../types';
import { Button } from '@/components/ui/button';
import MarkerModal from './MarkerModal';

interface SectionProps {
  section: SectionType;
  onAddMarker?: (sectionId: string, marker: Marker) => void;
}

export default function Section({ section, onAddMarker }: SectionProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Sort markers by order
  const sortedMarkers = React.useMemo(() => {
    return [...section.markers].sort((a, b) => a.order - b.order);
  }, [section.markers]);

  const handleAddMarker = (marker: Marker) => {
    onAddMarker?.(section.id, marker);
  };

  return (
    <div className="p-4 border rounded-lg">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{section.name}</h2>
        {section.start && (
          <p className="text-sm text-gray-500">
            Starts at: {section.start}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-4">
          {sortedMarkers.map(marker => (
            <div key={marker.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Position: {marker.position}
                    </span>
                    <span className="text-xs text-gray-400">
                      #{marker.order}
                    </span>
                  </div>
                  <p className="text-gray-800">{marker.note}</p>
                </div>
              </div>

              {marker.quote && (
                <blockquote className="mt-2 pl-4 border-l-2 border-gray-300 text-gray-600">
                  {marker.quote}
                </blockquote>
              )}

              {marker.dateCreated && (
                <div className="mt-2 text-xs text-gray-400">
                  Created: {new Date(Number(marker.dateCreated)).toLocaleDateString()}
                  {marker.dateUpdated && (
                    <span className="ml-2">
                      • Updated: {new Date(Number(marker.dateUpdated)).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <Button 
          onClick={() => setIsModalOpen(true)}
          variant="outline"
          className="w-full"
        >
          + Add Marker
        </Button>

        <MarkerModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddMarker={handleAddMarker}
        />
      </div>
    </div>
  );
}