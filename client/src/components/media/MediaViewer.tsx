import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { get as apiGet, post as apiPost, put as apiPut } from '@/utils/api';
import { MediaItem, Marker, Section as SectionType } from '../../types';
import { Button } from '@/components/ui/button';
import Section from './Section';
import { useMedia, useMediaOperations } from '@/contexts/MediaContext';

export default function MediaViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useMedia();
  const { setMedia, setLoading, setError } = useMediaOperations();
  const [activeMedia, setActiveMedia] = React.useState<MediaItem | null>(null);

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
      title: 'New Section',
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
        <Button
          variant="ghost"
          onClick={() => navigate('/library')}
          className="mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Library
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{activeMedia.name}</h1>
            {activeMedia.author && (
              <p className="text-xl text-gray-600">{activeMedia.author}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {sortedSections.map(section => (
          <Section 
            key={section.id}
            section={section}
            mediaType={activeMedia.type}
            onUpdateTitle={handleUpdateSectionTitle}
            onAddMarker={handleAddMarker}
          />
        ))}

        <Button 
          onClick={handleAddSection}
          variant="outline"
          className="w-full"
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
      </div>
    </div>
  );
}