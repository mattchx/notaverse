import React from 'react';
import { Section as SectionType, Marker, MediaType } from '../../types';
import { Button } from '@/components/ui/button';
import MarkerModal from './MarkerModal';
import EditMarkerModal from './EditMarkerModal';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SectionProps {
  section: SectionType;
  mediaType: MediaType;
  onUpdateTitle: (sectionId: string, title: string) => void;
  onAddMarker?: (sectionId: string, marker: Marker) => void;
  onDeleteSection?: (sectionId: string) => void;
  onDeleteMarker?: (sectionId: string, markerId: string) => void;
  onUpdateMarker?: (sectionId: string, marker: Marker) => void;
}

export default function Section({
  section,
  mediaType,
  onUpdateTitle,
  onAddMarker,
  onDeleteSection,
  onDeleteMarker,
  onUpdateMarker
}: SectionProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [title, setTitle] = React.useState(section.title);
  const [deleteSectionDialog, setDeleteSectionDialog] = React.useState(false);
  const [deleteMarkerDialog, setDeleteMarkerDialog] = React.useState<string | null>(null);
  const [editingMarker, setEditingMarker] = React.useState<Marker | null>(null);

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
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => setDeleteSectionDialog(true)}
                >
                  Delete
                </Button>
              </div>
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
                      {mediaType === 'book'
                        ? `Page: ${marker.position}`
                        : `Timestamp: ${section.number}:${marker.position.padStart(2, '0')}`
                      }
                    </span>
                    <span className="text-xs text-gray-400">
                      #{marker.order}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingMarker(marker)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => setDeleteMarkerDialog(marker.id)}
                      >
                        Delete
                      </Button>
                    </div>
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
          mediaType={mediaType}
          sectionNumber={section.number}
        />
      </div>

      {/* Delete Section Dialog */}
      <Dialog open={deleteSectionDialog} onOpenChange={setDeleteSectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Section</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this section? This action cannot be undone.
              All markers in this section will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteSectionDialog(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDeleteSection?.(section.id);
                setDeleteSectionDialog(false);
              }}
            >
              Delete Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Marker Dialog */}
      <Dialog open={!!deleteMarkerDialog} onOpenChange={() => setDeleteMarkerDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Marker</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this marker? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteMarkerDialog(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteMarkerDialog) {
                  onDeleteMarker?.(section.id, deleteMarkerDialog);
                  setDeleteMarkerDialog(null);
                }
              }}
            >
              Delete Marker
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Marker Modal */}
      {editingMarker && (
        <EditMarkerModal
          isOpen={!!editingMarker}
          onClose={() => setEditingMarker(null)}
          onUpdateMarker={(updatedMarker) => {
            onUpdateMarker?.(section.id, updatedMarker);
            setEditingMarker(null);
          }}
          marker={editingMarker}
          mediaType={mediaType}
          sectionNumber={section.number}
        />
      )}
    </div>
  );
}