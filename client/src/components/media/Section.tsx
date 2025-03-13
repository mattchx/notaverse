import React from 'react';
import { Section as SectionType, Marker, MediaType } from '../../types';
import { Button } from '@/components/ui/button';
import MarkerModal from './MarkerModal';
import { Input } from '@/components/ui/input';

interface SectionProps {
  section: SectionType;
  mediaType: MediaType;
  onUpdateTitle: (sectionId: string, title: string) => void;
  onAddMarker?: (sectionId: string, marker: Marker) => void;
}

export default function Section({ section, mediaType, onUpdateTitle, onAddMarker }: SectionProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [title, setTitle] = React.useState(section.title);

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTitle(section.id, title);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(section.title);
    setIsEditing(false);
  };

  const handleAddMarker = (marker: Marker) => {
    onAddMarker?.(section.id, marker);
  };

  const getSectionPrefix = () => {
    return mediaType === 'book' ? 'Chapter' : 'Hour';
  };

  // Sort markers by order
  const sortedMarkers = React.useMemo(() => {
    return [...section.markers].sort((a, b) => a.order - b.order);
  }, [section.markers]);

  return (
    <div className="p-4 border rounded-lg">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">
            {getSectionPrefix()} {section.number}
          </h2>
          {isEditing ? (
            <form onSubmit={handleTitleSubmit} className="flex items-center gap-2 flex-1">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1"
                placeholder="Enter section title"
                autoFocus
              />
              <Button type="submit" size="sm">Save</Button>
              <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            </form>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <span className="text-gray-600">- {section.title}</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            </div>
          )}
        </div>
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
                  Created: {new Date(marker.dateCreated).toLocaleDateString()}
                  {marker.dateUpdated && (
                    <span className="ml-2">
                      • Updated: {new Date(marker.dateUpdated).toLocaleDateString()}
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