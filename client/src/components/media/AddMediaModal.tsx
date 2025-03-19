import React from 'react';
import { post as apiPost } from '@/utils/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMediaOperations } from "@/contexts/MediaContext";
import { MediaItem, MediaType } from "@/types";
import { v4 as uuidv4 } from 'uuid';

interface AddMediaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  name: string;
  type: MediaType;
  author?: string;
  sourceUrl?: string;
  initialSection: string;
}

export function AddMediaModal({ open, onOpenChange }: AddMediaModalProps) {
  const { createMedia, setLoading, setError } = useMediaOperations();
  const [formData, setFormData] = React.useState<FormData>({
    name: '',
    type: 'book',
    author: '',
    sourceUrl: '',
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
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }

      // Create new media item
      const newMedia = {
        id: uuidv4(),
        name: formData.name.trim(),
        type: formData.type,
        author: formData.author?.trim(),
        sourceUrl: formData.sourceUrl?.trim(),
        sections: [
          {
            id: uuidv4(),
            title: formData.initialSection.trim() || 'Untitled Section',
            number: 1,
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
        sourceUrl: '',
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
          <DialogDescription>
            Add a new book, podcast, or article to your library. Required fields are marked with an asterisk (*).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name
              <span className="text-black">*</span>
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
              <option value="article">Article</option>
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
            <Label htmlFor="sourceUrl">Source URL</Label>
            <Input
              id="sourceUrl"
              name="sourceUrl"
              value={formData.sourceUrl}
              onChange={handleInputChange}
              type="url"
              placeholder="Enter source URL (e.g., podcast URL, book storage location)"
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initialSection">
              Initial Section Title
            </Label>
            <Input
              id="initialSection"
              name="initialSection"
              value={formData.initialSection}
              onChange={handleInputChange}
              placeholder="Enter section title (defaults to Untitled)"
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