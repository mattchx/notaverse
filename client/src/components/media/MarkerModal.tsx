import React from 'react';
import { Marker, MediaType } from '../../types';
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface MarkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMarker: (marker: Marker) => void;
  mediaType: MediaType;
  sectionNumber?: number;  // Added for audio hour context
}

export default function MarkerModal({ isOpen, onClose, onAddMarker, mediaType, sectionNumber }: MarkerModalProps) {
  const [position, setPosition] = React.useState('');
  const [quote, setQuote] = React.useState('');
  const [note, setNote] = React.useState('');
  const [error, setError] = React.useState<string>('');

  if (!isOpen) return null;

  const validatePosition = (value: string) => {
    if (mediaType === 'book') {
      // Only allow positive numbers for books
      // Check if value contains any non-digit characters
      if (!/^\d+$/.test(value)) {
        setError('Please enter only numbers');
        return false;
      }
      const pageNum = parseInt(value);
      if (pageNum < 1) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePosition(position)) {
      return;
    }

    const newMarker: Marker = {
      id: crypto.randomUUID(),
      position,
      order: Date.now(),
      quote: quote || undefined,
      note,
      dateCreated: new Date().toISOString(),
      dateUpdated: undefined
    };

    onAddMarker(newMarker);
    handleClose();
  };

  const handleClose = () => {
    setPosition('');
    setQuote('');
    setNote('');
    setError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center"
      onClick={() => handleClose()}
    >
      <div
        className="bg-white p-8 rounded-lg w-full max-w-2xl shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Add New Marker</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="position">
              {mediaType === 'book' ? 'Page Number' : 'Timestamp'}
            </Label>
            <div>
              {mediaType === 'podcast' && sectionNumber !== undefined && (
                <span className="block text-sm text-gray-500 mb-1">
                  Hour {sectionNumber}
                </span>
              )}
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
            </div>
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
          </div>

          <div className="grid w-full gap-1.5">
            <Label htmlFor="quote">Quote (optional)</Label>
            <Textarea
              id="quote"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Enter text from the book or audio"
              className="min-h-[75px]"
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
              className="min-h-[100px]"
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