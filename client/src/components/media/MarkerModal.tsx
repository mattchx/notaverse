import React from 'react';
import { Marker } from '../../types';
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface MarkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMarker: (marker: Marker) => void;
}

export default function MarkerModal({ isOpen, onClose, onAddMarker }: MarkerModalProps) {
  const [position, setPosition] = React.useState('');
  const [quote, setQuote] = React.useState('');
  const [note, setNote] = React.useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newMarker: Marker = {
      id: crypto.randomUUID(),
      position,
      order: Date.now(),
      quote: quote || undefined,
      note,
      dateCreated: Date.now().toString(),
      dateUpdated: undefined
    };

    onAddMarker(newMarker);
    handleClose();
  };

  const handleClose = () => {
    setPosition('');
    setQuote('');
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add New Marker</h2>
        
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Marker
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}