import React from 'react';
import { Marker, MediaType, NoteType } from '../../types';
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  sectionNumber?: number;  // Added for audio hour context
}

export default function EditMarkerModal({ isOpen, onClose, onUpdateMarker, marker, mediaType, sectionNumber }: EditMarkerModalProps) {
  const [position, setPosition] = React.useState(marker.position);
  const [type, setType] = React.useState<NoteType>(marker.type);
  const [error, setError] = React.useState<string>('');

  const noteTypes = [
    { value: 'general', label: 'General Note' },
    { value: 'concept', label: 'Core Concept' },
    { value: 'question', label: 'Question/Clarification' },
    { value: 'summary', label: 'Summary' }
  ] as const;

  const validatePosition = (value: string) => {
    if (mediaType === 'book' || mediaType === 'article') {
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
  const [quote, setQuote] = React.useState(marker.quote || '');
  const [note, setNote] = React.useState(marker.note);

  // Reset form when modal opens with new marker
  React.useEffect(() => {
    setPosition(marker.position);
    setQuote(marker.quote || '');
    setNote(marker.note);
    setType(marker.type);
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
      type,
      dateUpdated: new Date().toISOString()
    };

    onUpdateMarker(updatedMarker);
    handleClose();
  };

  const handleClose = () => {
    setPosition(marker.position);
    setQuote(marker.quote || '');
    setNote(marker.note);
    setType(marker.type);
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
              {mediaType === 'book' || mediaType === 'article' ? 'Page Number' : 'Timestamp'}
              <span className="text-black">*</span>
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
                placeholder={mediaType === 'book' || mediaType === 'article'
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
            <Label htmlFor="type">Note Type</Label>
            <Select defaultValue={type} onValueChange={(value: NoteType) => setType(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {noteTypes.map(noteType => (
                    <SelectItem key={noteType.value} value={noteType.value}>
                      {noteType.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
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
            <Label htmlFor="note">
              Note
              <span className="text-black">*</span>
            </Label>
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