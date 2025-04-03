import React from 'react';
import { post as apiPost } from '@/utils/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResourceOperations } from "@/contexts/ResourceContext";
import { Resource, ResourceType } from "@/types";
import { v4 as uuidv4 } from 'uuid';

interface AddResourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  name: string;
  type: ResourceType;
  author?: string;
  sourceUrl?: string;
  initialSection: string;
}

export function AddResourceModal({ open, onOpenChange }: AddResourceModalProps) {
  const { createResource, setLoading, setError } = useResourceOperations();
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

      // Process URL if provided (add http:// if missing)
      let processedUrl = formData.sourceUrl?.trim() || undefined;
      if (processedUrl && !processedUrl.match(/^https?:\/\//i)) {
        processedUrl = `http://${processedUrl}`;
      }

      const resourceId = uuidv4();
      
      // Construct the new media item
      const newResource = {
        id: resourceId,
        name: formData.name,
        type: formData.type,
        author: formData.author || undefined,
        sourceUrl: processedUrl,
        sections: [
          {
            id: uuidv4(),
            resourceId: resourceId,
            title: formData.initialSection.trim() || 'Untitled Section',
            number: 1,
            markers: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      // Send request to API
      const createdResource = await apiPost<Resource>('/resources', newResource);
      createResource(createdResource);
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
      console.error('Error creating resource:', error);
      if (error instanceof Error) {
        if (error.message === 'Unauthorized') {
          setError('You must be logged in to add resources. Please login and try again.');
        } else {
          setError(error.message);
        }
      } else {
        setError('Failed to create resource');
      }
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Resource Item</DialogTitle>
          <DialogDescription>
            Add a new book, podcast, article, or course to your library. Required fields are marked with an asterisk (*).
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
              placeholder="Enter Resource name"
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
              {isSubmitting ? 'Adding...' : 'Add Resource Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}