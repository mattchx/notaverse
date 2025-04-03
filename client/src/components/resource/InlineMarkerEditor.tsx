import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Marker, MarkerType, ResourceType } from '../../types';
import { Lightbulb, HelpCircle, FileText, X } from 'lucide-react';

interface InlineMarkerEditorProps {
  marker?: Marker; // If provided, we're in edit mode
  resourceType: ResourceType;
  sectionNumber?: number; // Make optional since it's not used
  sectionId: string;
  onSave: (marker: Marker | Omit<Marker, 'id'>) => void;
  onCancel: () => void;
  position?: string; // For new markers, can supply an initial position
}

export default function InlineMarkerEditor({
  marker,
  resourceType,
  sectionId,
  onSave,
  onCancel,
  position = '',
}: InlineMarkerEditorProps) {
  const [markerPosition, setMarkerPosition] = useState(marker?.position || position);
  const [quote, setQuote] = useState(marker?.quote || '');
  const [noteText, setNoteText] = useState(marker?.note || '');
  const [type, setType] = useState<MarkerType>(marker?.type || 'concept');
  
  const isEditMode = !!marker;

  const markerTypes = [
    { value: 'concept', label: 'Concept', icon: <Lightbulb className="w-4 h-4" /> },
    { value: 'question', label: 'Question', icon: <HelpCircle className="w-4 h-4" /> },
    { value: 'summary', label: 'Summary', icon: <FileText className="w-4 h-4" /> }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store the section ID in localStorage (for opening the section)
    localStorage.setItem('active_section', sectionId);
    
    if (isEditMode && marker) {
      // Update existing marker
      onSave({
        ...marker,
        position: markerPosition,
        quote,
        note: noteText,
        type
      });
    } else {
      // Create new marker
      onSave({
        position: markerPosition,
        quote,
        note: noteText,
        type,
        orderNum: 0, // This will be set by the backend
        sectionId: '', // This will be set by the parent component
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  };

  const positionLabel = resourceType === 'book' || resourceType === 'article' ? 'Page Number' : 'Timestamp';
  const positionPlaceholder = resourceType === 'book' || resourceType === 'article' 
    ? 'Enter page number' 
    : 'Enter timestamp (e.g. 1:23:45)';

  return (
    <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-4 relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2" 
        onClick={onCancel}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <h3 className="text-md font-medium mb-3">
        {isEditMode ? 'Edit Marker' : 'Add Marker'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="position" className="text-sm font-medium">
              {positionLabel}
            </Label>
            <Input
              id="position"
              value={markerPosition}
              onChange={(e) => setMarkerPosition(e.target.value)}
              placeholder={positionPlaceholder}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="type" className="text-sm font-medium">Type</Label>
            <Select value={type} onValueChange={(value: MarkerType) => setType(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select marker type" />
              </SelectTrigger>
              <SelectContent>
                {markerTypes.map(markerType => (
                  <SelectItem key={markerType.value} value={markerType.value}>
                    <div className="flex items-center gap-2">
                      {markerType.icon}
                      <span>{markerType.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="quote" className="text-sm font-medium">Quote</Label>
          <Textarea
            id="quote"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="Enter the text you want to quote"
            className="mt-1"
            rows={2}
          />
        </div>
        
        <div>
          <Label htmlFor="note" className="text-sm font-medium">Note</Label>
          <Textarea
            id="note"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Type your note here"
            className="mt-1"
            rows={3}
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditMode ? 'Save Changes' : 'Add Marker'}
          </Button>
        </div>
      </form>
    </div>
  );
} 