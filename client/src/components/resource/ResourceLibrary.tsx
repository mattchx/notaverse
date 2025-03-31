/** Table view for managing resources with sorting and actions */
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import { Resource } from '../../types';
import { apiDelete, apiGet } from '../../lib/api';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { EditResourceModal } from './EditResourceModal';
import { DeleteDialog } from '../ui/delete-dialog';

/** @returns Table interface for viewing and managing resources */
export default function ResourceLibrary() {
  const navigate = useNavigate();
  const { state, setError } = useContent();
  const [sortConfig, setSortConfig] = useState<{ key: keyof Resource; direction: 'asc' | 'desc' } | null>(null);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  const [resourceToEdit, setResourceToEdit] = useState<Resource | null>(null);
  const [resourceList, setResourceList] = useState<Resource[]>([]);

  const sortedItems = useMemo(() => {
    if (!sortConfig) return state.resources;

    return [...state.resources].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [state.resources, sortConfig]);

  /** Deletes resource and updates UI optimistically */
  const handleDelete = async () => {
    if (!resourceToDelete) return;

    const idToDelete = resourceToDelete.id;
    setResourceList(prev => prev.filter(item => item.id !== idToDelete));

    try {
      await apiDelete(`/resources/${idToDelete}`, {
        onSuccess: () => {
          setResourceToDelete(null);
        },
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete resource');
    }
  };

  const confirmDelete = (e: React.MouseEvent, resource: Resource) => {
    e.stopPropagation();
    setResourceToDelete(resource);
  };

  const fetchResources = async () => {
    try {
      const resources = await apiGet<Resource[]>('/resources');
      setResourceList(resources);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch resources');
    }
  };

  /** Navigates to resource detail view */
  const handleCardClick = (resource: Resource) => {
    navigate(`/library/item/${resource.id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Resource Library</h2>
        <Button onClick={() => setResourceToEdit({} as Resource)}>Add Resource</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Sections</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.map((resource) => (
            <TableRow
              key={resource.id}
              onClick={() => handleCardClick(resource)}
              className="cursor-pointer hover:bg-gray-50"
            >
              <TableCell className="font-medium">{resource.name}</TableCell>
              <TableCell>{resource.author || '-'}</TableCell>
              <TableCell className="capitalize">{resource.type}</TableCell>
              <TableCell>{resource.sections.length}</TableCell>
              <TableCell>
                {resource.sourceUrl ? (
                  <a
                    href={resource.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-600 hover:underline"
                  >
                    {new URL(resource.sourceUrl).hostname}
                  </a>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setResourceToEdit(resource);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => confirmDelete(e, resource)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {state.resources.length === 0 && !state.isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No resources in your library</p>
          <Button onClick={() => setResourceToEdit({} as Resource)}>Add Your First Resource</Button>
        </div>
      )}

      <DeleteDialog
        isOpen={!!resourceToDelete}
        onClose={() => setResourceToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Resource"
      >
        Are you sure you want to delete "{resourceToDelete?.name}"? This action cannot be undone.
      </DeleteDialog>

      <EditResourceModal
        open={!!resourceToEdit}
        onOpenChange={(open) => !open && setResourceToEdit(null)}
        resource={resourceToEdit}
      />
    </div>
  );
}