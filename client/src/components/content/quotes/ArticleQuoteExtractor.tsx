import React, { useEffect, useRef } from 'react';
import { useContent } from '../../../contexts/ContentContext';
import { useQuoteOperations } from '../../../contexts/QuoteContext';

interface QuoteSelectionInfo {
  text: string;
  sectionId: number;
}

export default function ArticleQuoteExtractor() {
  const { state: contentState } = useContent();
  const { addQuote } = useQuoteOperations();
  const contentRef = useRef<HTMLDivElement>(null);

  const getSelectedText = (): QuoteSelectionInfo | null => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    const text = range.toString().trim();
    if (!text) return null;

    // Find the section that contains the selection
    const sectionElement = range.commonAncestorContainer.parentElement?.closest('[data-section-id]');
    const sectionId = sectionElement?.getAttribute('data-section-id');
    
    if (!sectionId) return null;

    return {
      text,
      sectionId: parseInt(sectionId),
    };
  };

  const handleSelection = () => {
    const quoteInfo = getSelectedText();
    if (!quoteInfo || !contentState.activeContent) return;

    const newQuote = {
      id: Date.now(), // In a real app, this would come from the backend
      contentId: contentState.activeContent.id,
      sectionId: quoteInfo.sectionId,
      text: quoteInfo.text,
      createdAt: Date.now(), // Unix timestamp in milliseconds
    };

    addQuote(newQuote);
    window.getSelection()?.removeAllRanges();
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl+Q or Cmd+Q to create quote from selection
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'q') {
        event.preventDefault();
        handleSelection();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [contentState.activeContent]);

  // Split content into sections with data attributes
  const renderSectionContent = () => {
    if (!contentState.activeContent?.content) return null;

    return contentState.activeContent.sections.map(section => (
      <div 
        key={section.id}
        data-section-id={section.id}
        className="article-section mb-6"
      >
        <h2 className="text-2xl font-semibold mb-4">{section.name}</h2>
        {section.content && (
          <div dangerouslySetInnerHTML={{ __html: section.content }} />
        )}
      </div>
    ));
  };

  return (
    <div 
      ref={contentRef}
      className="relative prose prose-slate mx-auto"
    >
      <div className="bg-yellow-50 p-4 rounded-md mb-6 text-sm">
        Select text and press <kbd className="px-2 py-1 bg-white rounded border">⌘Q</kbd> to create a quote
      </div>
      {renderSectionContent()}
    </div>
  );
}