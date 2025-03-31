import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { get as apiGet, post as apiPost, put as apiPut, del as apiDelete } from '@/utils/api';
import { MediaItem, Marker, Section as SectionType } from '../../types';
import { Button } from '@/components/ui/button';
import Section from './Section';
import { useMedia, useMediaOperations } from '@/contexts/MediaContext';
import { Accordion } from '@/components/ui/accordion';

export default function MediaViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useMedia();
  const { setMedia, setLoading, setError, deleteMarker, updateMarker } = useMediaOperations();
  const [activeMedia, setActiveMedia] = React.useState<MediaItem | null>(null);
  const [openSections, setOpenSections] = React.useState<string[]>([]);

  // Keep all sections open for articles or single sections
  React.useEffect(() => {
    if (activeMedia) {
      if (activeMedia.type === 'article' || activeMedia.sections.length === 1) {
        setOpenSections(activeMedia.sections.map(section => section.id));
      }
    }
  }, [activeMedia]);

  // Fetch media item data
  React.useEffect(() => {
    if (!id) return;

    async function fetchMediaItem() {
      try {
        setLoading(true);
        const media = await apiGet<MediaItem>(`/media/${id}`, {
          credentials: 'include'
        });
        setActiveMedia(media);
        setMedia(media);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch media item');
      } finally {
        setLoading(false);
      }
    }

    fetchMediaItem();
  }, [id]);

  const handleAddSection = async () => {
    if (!activeMedia) return;

    const newSection: SectionType = {
      id: crypto.randomUUID(),
      title: 'Untitled Section',
      number: activeMedia.sections.length + 1,
      markers: []
    };

    try {
      setLoading(true);
      await apiPost<SectionType>(`/media/${activeMedia.id}/sections`, newSection, {
        credentials: 'include'
      });

      const updatedMedia = {
        ...activeMedia,
        sections: [...activeMedia.sections, newSection]
      };
      setActiveMedia(updatedMedia);
      setMedia(updatedMedia);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add section');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSectionTitle = async (sectionId: string, title: string) => {
    if (!activeMedia) return;

    try {
      setLoading(true);
      await apiPut<SectionType>(`/media/${activeMedia.id}/sections/${sectionId}`, { title }, {
        credentials: 'include'
      });

      const updatedMedia = {
        ...activeMedia,
        sections: activeMedia.sections.map(section => 
          section.id === sectionId 
            ? { ...section, title }
            : section
        )
      };
      setActiveMedia(updatedMedia);
      setMedia(updatedMedia);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update section');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMarker = async (sectionId: string, newMarker: Marker) => {
    if (!activeMedia) return;

    try {
      setLoading(true);
      await apiPost<Marker>(`/media/${activeMedia.id}/sections/${sectionId}/markers`, newMarker, {
        credentials: 'include'
      });

      const updatedMedia = {
        ...activeMedia,
        sections: activeMedia.sections.map(section =>
          section.id === sectionId
            ? { ...section, markers: [...section.markers, newMarker] }
            : section
        )
      };
      setActiveMedia(updatedMedia);
      setMedia(updatedMedia);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add marker');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!activeMedia) return;

    try {
      setLoading(true);
      await apiDelete(`/media/${activeMedia.id}/sections/${sectionId}`, {
        credentials: 'include'
      });

      const updatedMedia = {
        ...activeMedia,
        sections: activeMedia.sections.filter(section => section.id !== sectionId)
      };
      setActiveMedia(updatedMedia);
      setMedia(updatedMedia);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete section');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMarker = async (sectionId: string, markerId: string) => {
    if (!activeMedia) return;

    try {
      setLoading(true);
      await apiDelete(`/media/${activeMedia.id}/sections/${sectionId}/markers/${markerId}`, {
        credentials: 'include'
      });

      deleteMarker(sectionId, markerId);
      const updatedMedia = {
        ...activeMedia,
        sections: activeMedia.sections.map(section =>
          section.id === sectionId
            ? {
                ...section,
                markers: section.markers.filter(marker => marker.id !== markerId)
              }
            : section
        )
      };
      setActiveMedia(updatedMedia);
      setMedia(updatedMedia);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete marker');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMarker = async (sectionId: string, marker: Marker) => {
    if (!activeMedia) return;

    try {
      setLoading(true);
      const response = await apiPut<Marker>(
        `/media/${activeMedia.id}/sections/${sectionId}/markers/${marker.id}`,
        marker,
        { credentials: 'include' }
      );

      updateMarker(sectionId, response);
      const updatedMedia = {
        ...activeMedia,
        sections: activeMedia.sections.map(section =>
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
      setActiveMedia(updatedMedia);
      setMedia(updatedMedia);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update marker');
    } finally {
      setLoading(false);
    }
  };

  // Sort sections by number
  const sortedSections = React.useMemo(() => {
    if (!activeMedia) return [];
    return [...activeMedia.sections].sort((a, b) => a.number - b.number);
  }, [activeMedia?.sections]);

  if (state.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!activeMedia) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-red-500">{state.error || 'Media item not found'}</p>
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
          <h1 className="text-3xl font-bold">{activeMedia.name}</h1>
          {activeMedia.sourceUrl && (
            <a
              href={activeMedia.sourceUrl}
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
              {activeMedia.type === 'book' ? 'Open Book Link' : 'Listen to Podcast'}
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
        {activeMedia.author && (
          <p className="text-xl text-gray-600">{activeMedia.author}</p>
        )}
      </div>

      <div className="space-y-6">
        <Accordion
          type="multiple"
          value={openSections}
          onValueChange={(value) => {
            // For articles, prevent sections from being collapsed
            if (activeMedia?.type === 'article') {
              const allSectionIds = activeMedia.sections.map(section => section.id);
              setOpenSections(allSectionIds);
            } else {
              setOpenSections(value);
            }
          }}
        >
          {sortedSections.map(section => (
            <Section
              key={section.id}
              section={section}
              mediaType={activeMedia.type}
              onUpdateTitle={handleUpdateSectionTitle}
              onAddMarker={handleAddMarker}
              onDeleteSection={handleDeleteSection}
              onDeleteMarker={handleDeleteMarker}
              onUpdateMarker={handleUpdateMarker}
            />
          ))}
        </Accordion>

        {activeMedia.type !== 'article' && (
          <>
            <Button
              onClick={handleAddSection}
              variant="default"
              className="w-full bg-blue-200 text-blue-800 hover:bg-blue-300 border-2 border-blue-300 font-semibold"
              disabled={state.isLoading}
            >
              {state.isLoading ? 'Adding...' : '+ Add Section'}
            </Button>

            {activeMedia.sections.length === 0 && (
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