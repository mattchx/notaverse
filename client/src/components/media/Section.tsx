import React from 'react';
import { Section as SectionType, Marker, MediaType } from '../../types';
import { Button } from '@/components/ui/button';
import MarkerModal from './MarkerModal';
import EditMarkerModal from './EditMarkerModal';
import MarkerCard from './MarkerCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

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

  const sortedMarkers = React.useMemo(() => {
    return [...section.markers].sort((a, b) => parseInt(a.position) - parseInt(b.position));
  }, [section.markers]);

  return (
    <AccordionItem value={section.id} className="border rounded-lg">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2 flex-1">
          <h2 className="text-xl font-semibold">
            {getSectionPrefix()} {section.number}
          </h2>
          {isEditing ? (
            <form onSubmit={handleTitleSubmit} className="flex items-center gap-2 flex-1" onClick={e => e.stopPropagation()}>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
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
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteSectionDialog(true)}
                    className="text-red-600"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        {section.start && (
          <p className="text-sm text-gray-500 mt-1" onClick={e => e.stopPropagation()}>
            Starts at: {section.start}
          </p>
        )}
      </AccordionTrigger>

      <AccordionContent className="px-4">
        <div className="space-y-4">
          <div className="space-y-4">
            {sortedMarkers.map(marker => (
              <MarkerCard
                key={marker.id}
                marker={marker}
                mediaType={mediaType}
                sectionNumber={section.number}
                onEdit={setEditingMarker}
                onDelete={setDeleteMarkerDialog}
              />
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
      </AccordionContent>

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
    </AccordionItem>
  );
}