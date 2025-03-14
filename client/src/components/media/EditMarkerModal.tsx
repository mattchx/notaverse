import React from 'react';
import { Marker, MediaType } from '../../types';
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface EditMarkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateMarker: (marker: Marker) => void;
  marker: Marker;
  mediaType: MediaType;
}

export default function EditMarkerModal({ isOpen, onClose, onUpdateMarker, marker, mediaType }: EditMarkerModalProps) {
  const [position, setPosition] = React.useState(marker.position);
  const [error, setError] = React.useState<string>('');

  const validatePosition = (value: string) => {
    if (mediaType === 'book') {
      // Only allow positive numbers for books
      const pageNum = parseInt(value);
      if (isNaN(pageNum) || pageNum < 1 || value.includes('.')) {
        setError('Please enter a valid page number');
        return false;
      }
    } else {
      // For audio, only allow minutes (0-59)
      const minute = parseInt(value);
      if (isNaN(minute) || minute < 0 || minute > 59 || value.includes('.')) {
        setError('Please enter a valid minute (0-59)');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handlePositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPosition(value);
    validatePosition(value);
  };
  const [quote, setQuote] = React.useState(marker.quote || '');
  const [note, setNote] = React.useState(marker.note);

  // Reset form when modal opens with new marker
  React.useEffect(() => {
    setPosition(marker.position);
    setQuote(marker.quote || '');
    setNote(marker.note);
  }, [marker]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePosition(position)) {
      return;
    }

    const updatedMarker: Marker = {
      ...marker,
      position,
      quote: quote || undefined,
      note,
      dateUpdated: Date.now().toString()
    };

    onUpdateMarker(updatedMarker);
    handleClose();
  };

  const handleClose = () => {
    setPosition(marker.position);
    setQuote(marker.quote || '');
    setNote(marker.note);
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Marker</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="position">
              {mediaType === 'book' ? 'Page Number' : 'Minute'}
            </Label>
            <Input
              id="position"
              value={position}
              onChange={handlePositionChange}
              placeholder={mediaType === 'book'
                ? "Enter page number (e.g., 42)"
                : "Enter minute (0-59)"
              }
              required
            />
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
          </div>

          <div className="grid w-full gap-1.5">
            <Label htmlFor="quote">Quote (optional)</Label>
            <Input
              id="quote"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Enter text from the book or audio"
            />
          </div>

          <div className="grid w-full gap-1.5">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Type your note here"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              Update Marker
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}