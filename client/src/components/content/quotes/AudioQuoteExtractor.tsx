import React, { useRef, useState } from 'react';
import { useContent } from '../../../contexts/ContentContext';
import { useQuoteOperations } from '../../../contexts/QuoteContext';
import { Section } from '../../../types/content';

interface AudioQuoteExtractorProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export default function AudioQuoteExtractor({ audioRef }: AudioQuoteExtractorProps) {
  const { state: contentState } = useContent();
  const { addQuote } = useQuoteOperations();
  const [isQuoting, setIsQuoting] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const currentSection = useRef<Section | null>(null);

  const findCurrentSection = (timestamp: number): Section | null => {
    if (!contentState.activeContent?.sections) return null;

    const sections = contentState.activeContent.sections;
    // Find the last section that starts before the current timestamp
    return sections.reduce((current, section) => {
      if (section.start === undefined) return current;
      if (section.start <= timestamp && (!current || section.start > (current.start || 0))) {
        return section;
      }
      return current;
    }, null as Section | null);
  };

  const formatTimestamp = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartQuote = () => {
    if (!audioRef.current || !contentState.activeContent) return;

    const currentTime = audioRef.current.currentTime;
    const section = findCurrentSection(currentTime);
    
    if (!section) {
      console.error('No section found for the current timestamp');
      return;
    }

    setIsQuoting(true);
    setStartTime(currentTime);
    currentSection.current = section;
  };

  const handleEndQuote = async () => {
    if (!audioRef.current || !contentState.activeContent || startTime === null || !currentSection.current) return;

    const endTime = audioRef.current.currentTime;
    
    // Create a new quote
    const newQuote = {
      id: Date.now(),
      contentId: contentState.activeContent.id,
      text: `Quote from ${formatTimestamp(startTime)} to ${formatTimestamp(endTime)}`, // Placeholder text
      timestamp: Math.floor(startTime * 1000), // Convert to milliseconds
      sectionId: currentSection.current.id,
      createdAt: Date.now(),
    };

    addQuote(newQuote);
    setIsQuoting(false);
    setStartTime(null);
    currentSection.current = null;
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-4 flex items-center gap-4">
      {!isQuoting ? (
        <button
          onClick={handleStartQuote}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <span>Start Quote</span>
        </button>
      ) : (
        <>
          <div className="text-sm text-gray-600">
            Started at: {startTime !== null ? formatTimestamp(startTime) : '--:--'}
          </div>
          <button
            onClick={handleEndQuote}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <span>End Quote</span>
          </button>
        </>
      )}
      <div className="text-xs text-gray-500">
        Current Section: {currentSection.current?.name || 'None'}
      </div>
    </div>
  );
}