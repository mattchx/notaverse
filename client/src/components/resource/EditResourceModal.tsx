import React from 'react';
import { put as apiPut } from '@/utils/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResourceOperations } from "@/contexts/ResourceContext";
import { Resource, ResourceType } from "@/types";

interface EditResourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: Resource | null;
}

interface FormData {
  name: string;
  type: ResourceType;
  author?: string;
  sourceUrl?: string;
}

export function EditResourceModal({ open, onOpenChange, resource }: EditResourceModalProps) {
  const { updateResource, setLoading, setError } = useResourceOperations();
  const [formData, setFormData] = React.useState<FormData>({
    name: '',
    type: 'book',
    author: '',
    sourceUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Update form data when resource changes
  React.useEffect(() => {
    if (resource) {
      setFormData({
        name: resource.name,
        type: resource.type,
        author: resource.author || '',
        sourceUrl: resource.sourceUrl || '',
      });
    }
  }, [resource]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resource) return;

    setIsSubmitting(true);
    setLoading(true);

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }

      // Process URL if provided (add http:// if missing)
      let processedUrl = formData.sourceUrl?.trim() || undefined;
      if (processedUrl && !processedUrl.match(/^https?:\/\//i)) {
        processedUrl = `http://${processedUrl}`;
      }

      // Create updated resource item
      const updatedResource = {
        ...resource,
        name: formData.name.trim(),
        type: formData.type,
        author: formData.author?.trim(),
        sourceUrl: processedUrl,
      };

      // Send request to API
      const result = await apiPut<Resource>(`/resources/${resource.id}`, updatedResource);
      updateResource(result);
      onOpenChange(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update resource item');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  if (!resource) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Resource Item</DialogTitle>
          <DialogDescription>
            Update the details of your book, podcast, article, or course. Required fields are marked with an asterisk (*).
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
              placeholder="Enter resource name"
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
              <option value="course">Course</option>
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
              placeholder="Enter source URL (e.g., example.com)"
              maxLength={500}
            />
            <p className="text-xs text-gray-500">URL will be automatically formatted with http:// if not specified</p>
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