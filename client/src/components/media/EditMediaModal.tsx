import React from 'react';
import { put as apiPut } from '@/utils/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMediaOperations } from "@/contexts/MediaContext";
import { MediaItem, MediaType } from "@/types";

interface EditMediaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaItem: MediaItem | null;
}

interface FormData {
  name: string;
  type: MediaType;
  author?: string;
  sourceUrl?: string;
}

export function EditMediaModal({ open, onOpenChange, mediaItem }: EditMediaModalProps) {
  const { updateMedia, setLoading, setError } = useMediaOperations();
  const [formData, setFormData] = React.useState<FormData>({
    name: '',
    type: 'book',
    author: '',
    sourceUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Update form data when mediaItem changes
  React.useEffect(() => {
    if (mediaItem) {
      setFormData({
        name: mediaItem.name,
        type: mediaItem.type,
        author: mediaItem.author || '',
        sourceUrl: mediaItem.sourceUrl || '',
      });
    }
  }, [mediaItem]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaItem) return;
    
    setIsSubmitting(true);
    setLoading(true);

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }

      // Create updated media item
      const updatedMedia = {
        ...mediaItem,
        name: formData.name.trim(),
        type: formData.type,
        author: formData.author?.trim(),
        sourceUrl: formData.sourceUrl?.trim(),
      };

      // Send request to API
      const result = await apiPut<MediaItem>(`/media/${mediaItem.id}`, updatedMedia);
      updateMedia(result);
      onOpenChange(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update media item');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  if (!mediaItem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Media Item</DialogTitle>
          <DialogDescription>
            Update the details of your book, podcast, or article. Required fields are marked with an asterisk (*).
          </DialogDescription>
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}