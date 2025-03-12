import { MediaType } from '../types';

/**
 * Generates a consistent section name based on media type and position
 */
export function formatSectionName(mediaType: MediaType, position: number): string {
  switch (mediaType) {
    case 'book':
      return `Chapter ${position}`;
    case 'podcast':
      return `Hour ${position}`;
    default:
      return `Section ${position}`;
  }
}