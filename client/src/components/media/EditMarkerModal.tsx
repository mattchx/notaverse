import React from 'react';
import { Marker } from '../../types';
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
}

export default function EditMarkerModal({ isOpen, onClose, onUpdateMarker, marker }: EditMarkerModalProps) {
  const [position, setPosition] = React.useState(marker.position);
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
            <Label htmlFor="position">Position (page number or timestamp)</Label>
            <Input
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Enter the page number or timestamp"
              required
            />
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