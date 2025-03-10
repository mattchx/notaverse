import React from 'react';
import { useNavigate } from 'react-router';
import { MediaItem, Marker, Section as SectionType } from '../../types';
import { Button } from '@/components/ui/button';
import { mockData } from './MediaLibrary';
import Section from './Section';

export default function MediaViewer() {
  const [activeMedia, setActiveMedia] = React.useState<MediaItem>(mockData[0]);
  const navigate = useNavigate();

  const handleAddSection = () => {
    const newSection: SectionType = {
      id: crypto.randomUUID(),
      name: `Section ${activeMedia.sections.length + 1}`,
      order: activeMedia.sections.length,
      markers: []
    };

    setActiveMedia(prevMedia => ({
      ...prevMedia,
      sections: [...prevMedia.sections, newSection]
    }));
  };

  const handleAddMarker = (sectionId: string, newMarker: Marker) => {
    setActiveMedia(prevMedia => ({
      ...prevMedia,
      sections: prevMedia.sections.map(section => 
        section.id === sectionId 
          ? { ...section, markers: [...section.markers, newMarker] }
          : section
      )
    }));
  };

  // Sort sections by order
  const sortedSections = React.useMemo(() => {
    return [...activeMedia.sections].sort((a, b) => a.order - b.order);
  }, [activeMedia.sections]);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back
        </Button>
        <h1 className="text-3xl font-bold">{activeMedia.name}</h1>
        {activeMedia.author && (
          <p className="text-xl text-gray-600">{activeMedia.author}</p>
        )}
      </div>

      <div className="space-y-6">
        {sortedSections.map(section => (
          <Section 
            key={section.id}
            section={section}
            onAddMarker={handleAddMarker}
          />
        ))}

        <Button 
          onClick={handleAddSection}
          variant="outline"
          className="w-full"
        >
          + Add Section
        </Button>

        {activeMedia.sections.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No sections yet</p>
            <Button onClick={handleAddSection}>Add First Section</Button>
          </div>
        )}
      </div>
    </div>
  );
}