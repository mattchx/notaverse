import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Marker, MarkerType, ResourceType } from '../../types';

interface MarkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMarker: (marker: Omit<Marker, 'id'>) => void;
  resourceType: ResourceType;
  sectionNumber?: number;
}

export default function MarkerModal({ isOpen, onClose, onAddMarker, resourceType, sectionNumber }: MarkerModalProps) {
  const [position, setPosition] = React.useState('');
  const [quote, setQuote] = React.useState('');
  const [markerText, setMarkerText] = React.useState('');
  const [type, setType] = React.useState<MarkerType>('concept');

  const markerTypes = [
    { value: 'concept', label: 'Concept' },
    { value: 'question', label: 'Question' },
    { value: 'summary', label: 'Summary' }
  ];

  React.useEffect(() => {
    if (isOpen) {
      setPosition('');
      setQuote('');
      setMarkerText('');
      setType('concept');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMarker({
      position,
      quote,
      marker: markerText,
      type,
      orderNum: 0, // This will be set by the backend
      sectionId: '', // This will be set by the parent component
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Marker</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="position">
              {resourceType === 'book' || resourceType === 'article' ? 'Page Number' : 'Timestamp'}
            </Label>
            <Input
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder={resourceType === 'book' || resourceType === 'article' ? 'Enter page number' : 'Enter timestamp (e.g. 1:23:45)'}
            />
          </div>

          {resourceType === 'podcast' && sectionNumber !== undefined && (
            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Input
                id="section"
                value={sectionNumber}
                disabled
                className="bg-gray-50"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="quote">Quote</Label>
            <Textarea
              id="quote"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Enter the text you want to quote"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(value: MarkerType) => setType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select marker type" />
              </SelectTrigger>
              <SelectContent>
                {markerTypes.map(markerType => (
                  <SelectItem key={markerType.value} value={markerType.value}>
                    {markerType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="marker">Marker</Label>
            <Textarea
              id="marker"
              value={markerText}
              onChange={(e) => setMarkerText(e.target.value)}
              placeholder="Type your marker here"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Marker
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}