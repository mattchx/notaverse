import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { get as apiGet, post as apiPost, put as apiPut, del as apiDelete } from '@/utils/api';
import { Resource, Marker, Section as SectionType } from '../../types';
import { Button } from '@/components/ui/button';
import Section from './Section';
import { useResource, useResourceOperations } from '@/contexts/ResourceContext';
import { Accordion } from '@/components/ui/accordion';

export default function ResourceViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useResource();
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

  // Keep all sections open for articles or single sections
  React.useEffect(() => {
    if (activeResource) {
      if (activeResource.type === 'article' || activeResource.sections.length === 1) {
        setOpenSections(activeResource.sections.map(section => section.id));
      } else {
        // Close all sections by default when there are multiple sections
        setOpenSections([]);
      }
    }
  }, [activeResource]);

  // Keep section open when a marker is added
  React.useEffect(() => {
    if (lastAddedSectionId) {
      console.log("Ensuring section stays open:", lastAddedSectionId);
      setOpenSections(prev => {
        if (!prev.includes(lastAddedSectionId)) {
          return [...prev, lastAddedSectionId];
        }
        return prev;
      });
      
      // Clear last added section after a delay
      const timer = setTimeout(() => {
        setLastAddedSectionId(null);
      }, 500);
      
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

    // Immediately mark this section as the last active section
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

    // Ensure section stays open after deletion
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

    // Ensure section stays open
    setLastAddedSectionId(sectionId);
    setOpenSections(prev => 
      prev.includes(sectionId) ? prev : [...prev, sectionId]
    );

    try {
      setLoading(true);
      const response = await apiPut<Marker>(
        `/resources/${activeResource.id}/sections/${sectionId}/markers/${marker.id}`,
        marker
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

  if (state.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!activeResource) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-red-500">{state.error || 'Resource item not found'}</p>
          <Button onClick={() => navigate('/library')} className="mt-4">
            Return to Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-3xl font-bold">{activeResource.name}</h1>
          {activeResource.sourceUrl && (
            <a
              href={activeResource.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              {activeResource.type === 'book' ? 'Open Book Link' : 'Listen to Podcast'}
            </a>
          )}
          <div className="ml-auto">
            <Button
              variant="outline"
              onClick={() => navigate('/library')}
              className="border-blue-400 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Back to Library
            </Button>
          </div>
        </div>
        {activeResource.author && (
          <p className="text-xl text-gray-600">{activeResource.author}</p>
        )}
      </div>

      <div className="space-y-6">
        <Accordion
          type="multiple"
          value={openSections}
          onValueChange={(value) => {
            try {
              // For articles, prevent sections from being collapsed
              if (activeResource?.type === 'article') {
                const allSectionIds = activeResource.sections.map(section => section.id);
                setOpenSections(allSectionIds);
              } else if (lastAddedSectionId && !value.includes(lastAddedSectionId)) {
                // Keep section open if we just added a marker to it
                setOpenSections([...value, lastAddedSectionId]);
              } else {
                setOpenSections(value);
              }
            } catch (error) {
              console.error('Error updating accordion state:', error);
              // Fallback to a safe state
              if (activeResource?.sections.length) {
                setOpenSections([activeResource.sections[0].id]);
              }
            }
          }}
        >
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
              isOpen={openSections.includes(section.id) || section.id === lastAddedSectionId}
            />
          ))}
        </Accordion>

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