import React from 'react';
import { post as apiPost } from '@/utils/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMediaOperations } from "@/contexts/MediaContext";
import { MediaItem, MediaType } from "@/types";
import { v4 as uuidv4 } from 'uuid';
import { formatSectionName } from '@/utils/sectionNames';

interface AddMediaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  name: string;
  type: MediaType;
  author?: string;
  initialSection: string;
}

export function AddMediaModal({ open, onOpenChange }: AddMediaModalProps) {
  const { createMedia, setLoading, setError } = useMediaOperations();
  const [formData, setFormData] = React.useState<FormData>({
    name: '',
    type: 'book',
    author: '',
    initialSection: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoading(true);

    try {
      // Validate form
      if (!formData.name.trim() || !formData.initialSection.trim()) {
        throw new Error('Name and initial section are required');
      }

      // Create new media item
      const newMedia = {
        id: uuidv4(),
        name: formData.name.trim(),
        type: formData.type,
        author: formData.author?.trim(),
        sections: [
          {
            id: uuidv4(),
            name: formData.initialSection.trim() || formatSectionName(formData.type, 1),
            order: 1,
            markers: [],
          }
        ],
      };
      // Send request to API
      const createdMedia = await apiPost<MediaItem>('/media', newMedia);
      createMedia(createdMedia);
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: '',
        type: 'book',
        author: '',
        initialSection: '',
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create media item');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Media Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter media name"
              required
              minLength={2}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">
              Type
              <span className="text-red-500">*</span>
            </Label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="book">Book</option>
              <option value="podcast">Podcast</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author/Creator</Label>
            <Input
              id="author"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              placeholder="Enter author or creator name"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initialSection">
              Initial Section Name
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="initialSection"
              name="initialSection"
              value={formData.initialSection}
              onChange={handleInputChange}
              placeholder={`Enter first section name (defaults to ${formData.type === 'book' ? 'Chapter 1' : 'Hour 1'})`}
              required
              minLength={2}
              maxLength={100}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Media Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}