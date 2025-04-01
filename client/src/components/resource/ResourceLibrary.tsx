/** Table view for managing resources with sorting and actions */
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useResource, useResourceOperations } from '../../contexts/ResourceContext';
import { Resource } from '../../types';
import { get as apiGet, del as apiDelete } from '../../utils/api';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { EditResourceModal } from './EditResourceModal';
import { AddResourceModal } from './AddResourceModal';

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '../ui/dialog';

/** Custom DeleteDialog component using Dialog from ui/dialog */
const DeleteDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  children 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  children: React.ReactNode 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">{children}</div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/** @returns Table interface for viewing and managing resources */
export default function ResourceLibrary() {
  const navigate = useNavigate();
  const { state } = useResource();
  const { setError, setResourceList } = useResourceOperations();
  const [sortConfig, setSortConfig] = useState<{ key: keyof Resource; direction: 'asc' | 'desc' } | null>(null);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  const [resourceToEdit, setResourceToEdit] = useState<Resource | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Fetch resources when component mounts
  useEffect(() => {
    fetchResources();
  }, []);

  const sortedItems = useMemo(() => {
    if (!sortConfig) return state.resources;

    return [...state.resources].sort((a, b) => {
      const aValue = a[sortConfig.key] ?? '';
      const bValue = b[sortConfig.key] ?? '';
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [state.resources, sortConfig]);

  /** Sort the resources by the specified key */
  const requestSort = (key: keyof Resource) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  /** Deletes resource and updates UI optimistically */
  const handleDelete = async () => {
    if (!resourceToDelete) return;

    const idToDelete = resourceToDelete.id;

    try {
      await apiDelete(`/resources/${idToDelete}`);
      setResourceToDelete(null);
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
    navigate(`/resources/${resource.id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Resource Library</h2>
        <Button onClick={() => setIsAddModalOpen(true)}>Add Resource</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => requestSort('name')} className="cursor-pointer">
              Name {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead onClick={() => requestSort('author')} className="cursor-pointer">
              Author {sortConfig?.key === 'author' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead onClick={() => requestSort('type')} className="cursor-pointer">
              Type {sortConfig?.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead>Sections</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.map((resource: Resource) => (
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
          <Button onClick={() => setIsAddModalOpen(true)}>Add Your First Resource</Button>
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
        onOpenChange={(open: boolean) => !open && setResourceToEdit(null)}
        resource={resourceToEdit}
      />

      <AddResourceModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />
    </div>
  );
}