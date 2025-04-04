import React from 'react';
import { useParams } from 'react-router';
import { get as apiGet, post as apiPost, put as apiPut, del as apiDelete } from '@/utils/api';
import { Resource, Marker, Section as SectionType } from '../../types';
import { Button } from '@/components/ui/button';
import Section from './Section';
import { useResource, useResourceOperations } from '@/contexts/ResourceContext';
import { VisibilityToggle } from '../social/VisibilityToggle';
import { useAuth } from '@/contexts/AuthContext';

export default function ResourceViewer() {
  const { id } = useParams();
  const { state } = useResource();
  const { user } = useAuth();
  const { setResource, setLoading, setError, deleteMarker, updateMarker } = useResourceOperations();
  
  // Resource state
  const [activeResource, setActiveResource] = React.useState<Resource | null>(null);
  
  // Accordion state management
  const [openSections, setOpenSections] = React.useState<string[]>([]);
  const [lastAddedSectionId, setLastAddedSectionId] = React.useState<string | null>(null);

  // Check localStorage for any sections that should be opened (from marker operations)
  React.useEffect(() => {
    // One-time check for localStorage on component mount
    const activeSectionId = localStorage.getItem('active_section');
    if (activeSectionId) {
      console.log("Found active section in localStorage:", activeSectionId);
      
      // Update openSections to include this section
      setOpenSections(prev => {
        if (!prev.includes(activeSectionId)) {
          return [...prev, activeSectionId];
        }
        return prev;
      });
      
      // Clear localStorage
      localStorage.removeItem('active_section');
    }
  }, []);

  // Keep all sections open for articles only
  React.useEffect(() => {
    if (activeResource) {
      if (activeResource.type === 'article') {
        // Keep all sections open for articles only
        setOpenSections(activeResource.sections.map(section => section.id));
      } else if (activeResource.sections.length === 1 && openSections.length === 0) {
        // For single section resources, default to open initially
        const sectionId = activeResource.sections[0].id;
        setOpenSections([sectionId]);
      }
    }
  }, [activeResource]);

  // Update section state when a marker is added
  React.useEffect(() => {
    if (lastAddedSectionId) {
      console.log("Ensuring section is in open sections:", lastAddedSectionId);
      setOpenSections(prev => {
        if (!prev.includes(lastAddedSectionId)) {
          return [...prev, lastAddedSectionId];
        }
        return prev;
      });

      // Clear last added section after a delay
      const timer = setTimeout(() => {
        setLastAddedSectionId(null);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [lastAddedSectionId]);

  // Fetch Resource item data
  React.useEffect(() => {
    if (!id) return;

    async function fetchResourceItem() {
      try {
        setLoading(true);
        const resource = await apiGet<Resource>(`/resources/${id}`);
        setActiveResource(resource);
        setResource(resource);
      } catch (error) {
        console.error('Resource fetch error:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch resource');
      } finally {
        setLoading(false);
      }
    }

    fetchResourceItem();
  }, [id]);

  const handleAddSection = async () => {
    if (!activeResource) return;

    // Get the next order number based on existing sections
    const nextNumber = activeResource.sections.length > 0 
      ? Math.max(...activeResource.sections.map(s => s.number)) + 1 
      : 1;

    const newSection: SectionType = {
      id: crypto.randomUUID(),
      resourceId: activeResource.id,
      title: 'Untitled Section',
      number: nextNumber,
      markers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      setLoading(true);
      await apiPost<SectionType>(`/resources/${activeResource.id}/sections`, newSection);

      const updatedResource = {
        ...activeResource,
        sections: [...activeResource.sections, newSection]
      };
      setActiveResource(updatedResource);
      setResource(updatedResource);
      setLastAddedSectionId(newSection.id);
    } catch (error) {
      console.error('Add section error:', error);
      setError(error instanceof Error ? error.message : 'Failed to add section');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSectionTitle = async (sectionId: string, title: string) => {
    if (!activeResource) return;

    try {
      setLoading(true);
      await apiPut<SectionType>(`/resources/${activeResource.id}/sections/${sectionId}`, { title });

      const updatedResource = {
        ...activeResource,
        sections: activeResource.sections.map(section => 
          section.id === sectionId 
            ? { ...section, title }
            : section
        )
      };
      setActiveResource(updatedResource);
      setResource(updatedResource);
    } catch (error) {
      console.error('Update section error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update section');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMarker = async (sectionId: string, newMarkerData: Omit<Marker, 'id'>) => {
    if (!activeResource) return;

    // Mark this section as the last active section
    setLastAddedSectionId(sectionId);
    
    // Make sure section is in openSections
    setOpenSections(prev => 
      prev.includes(sectionId) ? prev : [...prev, sectionId]
    );
    
    const newMarker: Marker = {
      ...newMarkerData,
      id: crypto.randomUUID(),
      sectionId
    };

    try {
      setLoading(true);
      await apiPost<Marker>(`/resources/${activeResource.id}/sections/${sectionId}/markers`, newMarker);

      const updatedResource = {
        ...activeResource,
        sections: activeResource.sections.map(section =>
          section.id === sectionId
            ? { ...section, markers: [...section.markers, newMarker] }
            : section
        )
      };
      setActiveResource(updatedResource);
      setResource(updatedResource);
    } catch (error) {
      console.error('Add marker error:', error);
      setError(error instanceof Error ? error.message : 'Failed to add marker');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!activeResource) return;

    try {
      setLoading(true);
      await apiDelete(`/resources/${activeResource.id}/sections/${sectionId}`);

      // Get the deleted section's number
      const deletedSection = activeResource.sections.find(s => s.id === sectionId);
      if (!deletedSection) {
        throw new Error('Section not found');
      }
      
      const deletedNumber = deletedSection.number;
      
      // Filter out the deleted section
      const remainingSections = activeResource.sections.filter(section => section.id !== sectionId);
      
      // Adjust number for sections that come after the deleted section
      const reorderedSections = remainingSections.map(section => {
        if (section.number > deletedNumber) {
          // Decrease the number for sections that were after the deleted one
          return {
            ...section,
            number: section.number - 1
          };
        }
        return section;
      });

      const updatedResource = {
        ...activeResource,
        sections: reorderedSections
      };
      
      setActiveResource(updatedResource);
      setResource(updatedResource);
    } catch (error) {
      console.error('Delete section error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete section');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMarker = async (sectionId: string, markerId: string) => {
    if (!activeResource) return;

    // Ensure section is in openSections
    setLastAddedSectionId(sectionId);
    setOpenSections(prev => 
      prev.includes(sectionId) ? prev : [...prev, sectionId]
    );

    try {
      setLoading(true);
      await apiDelete(`/resources/${activeResource.id}/sections/${sectionId}/markers/${markerId}`);

      deleteMarker(sectionId, markerId);
      const updatedResource = {
        ...activeResource,
        sections: activeResource.sections.map(section =>
          section.id === sectionId
            ? {
                ...section,
                markers: section.markers.filter(marker => marker.id !== markerId)
              }
            : section
        )
      };
      setActiveResource(updatedResource);
      setResource(updatedResource);
    } catch (error) {
      console.error('Delete marker error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete marker');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMarker = async (sectionId: string, marker: Marker) => {
    if (!activeResource) return;

    // Ensure section is in openSections
    setLastAddedSectionId(sectionId);
    setOpenSections(prev => 
      prev.includes(sectionId) ? prev : [...prev, sectionId]
    );

    try {
      setLoading(true);
      // Make sure we send all required marker fields including type
      const markerData = {
        position: marker.position,
        quote: marker.quote,
        note: marker.note,
        type: marker.type
      };
      
      const response = await apiPut<Marker>(
        `/resources/${activeResource.id}/sections/${sectionId}/markers/${marker.id}`,
        markerData
      );

      updateMarker(sectionId, response);
      const updatedResource = {
        ...activeResource,
        sections: activeResource.sections.map(section =>
          section.id === sectionId
            ? {
                ...section,
                markers: section.markers.map(m =>
                  m.id === marker.id ? response : m
                )
              }
            : section
        )
      };
      setActiveResource(updatedResource);
      setResource(updatedResource);
    } catch (error) {
      console.error('Update marker error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update marker');
    } finally {
      setLoading(false);
    }
  };

  // Sort sections by number
  const sortedSections = React.useMemo(() => {
    if (!activeResource) return [];
    return [...activeResource.sections].sort((a, b) => a.number - b.number);
  }, [activeResource?.sections]);

  const handleSectionToggle = (sectionId: string, isOpen: boolean) => {
    if (isOpen) {
      // Add section to open sections
      setOpenSections(prev => [...prev, sectionId]);
    } else {
      // Remove section from open sections
      setOpenSections(prev => prev.filter(id => id !== sectionId));
    }
  };

  const handleVisibilityChange = (isPublic: boolean) => {
    if (activeResource) {
      setActiveResource({
        ...activeResource,
        isPublic
      });
    }
  };

  if (state.isLoading) {
    return <div className="flex items-center justify-center h-96">Loading resource...</div>;
  }

  if (state.error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        Error: {state.error}
      </div>
    );
  }

  if (!activeResource) {
    return <div className="p-4">Resource not found</div>;
  }

  const isOwner = user?.id === activeResource.userId;

  return (
    <div className="py-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{activeResource.name}</h1>
          {activeResource.author && (
            <p className="text-gray-600">by {activeResource.author}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isOwner && (
            <VisibilityToggle 
              resourceId={activeResource.id} 
              initialIsPublic={!!activeResource.isPublic}
              onVisibilityChange={handleVisibilityChange}
            />
          )}
          <Button onClick={handleAddSection}>Add Section</Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          {sortedSections.map(section => (
            <Section
              key={section.id}
              id={section.id}
              title={section.title}
              number={section.number}
              markers={section.markers}
              resourceType={activeResource.type}
              onAddMarker={(marker) => handleAddMarker(section.id, marker)}
              onDeleteMarker={(markerId) => handleDeleteMarker(section.id, markerId)}
              onUpdateMarker={(marker) => handleUpdateMarker(section.id, marker)}
              onUpdateTitle={(title) => handleUpdateSectionTitle(section.id, title)}
              onDeleteSection={() => handleDeleteSection(section.id)}
              isOpen={openSections.includes(section.id)}
              onToggle={handleSectionToggle}
            />
          ))}
        </div>

        {activeResource.type !== 'article' && (
          <>
            <Button
              onClick={handleAddSection}
              variant="default"
              className="w-full bg-blue-200 text-blue-800 hover:bg-blue-300 border-2 border-blue-300 font-semibold"
              disabled={state.isLoading}
            >
              {state.isLoading ? 'Adding...' : '+ Add Section'}
            </Button>

            {activeResource.sections.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No sections yet</p>
                <Button
                  onClick={handleAddSection}
                  disabled={state.isLoading}
                >
                  Add First Section
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}