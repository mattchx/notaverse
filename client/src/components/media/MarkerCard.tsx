import React from 'react';
import { Marker, MediaType } from '../../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface MarkerCardProps {
  marker: Marker;
  mediaType: MediaType;
  sectionNumber: number;
  onEdit: (marker: Marker) => void;
  onDelete: (markerId: string) => void;
}

export default function MarkerCard({
  marker,
  mediaType,
  sectionNumber,
  onEdit,
  onDelete,
}: MarkerCardProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">
            {mediaType === 'book' || mediaType === 'article'
              ? `Page: ${marker.position}`
              : `Timestamp: ${sectionNumber}:${marker.position.padStart(2, '0')}`}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <svg
                className="h-4 w-4"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(marker)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(marker.id)}
              className="text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 space-y-2">


        {marker.quote && (
          <blockquote className="pl-4 border-l-2 border-gray-300 text-gray-600 italic">
            "{marker.quote}"
          </blockquote>
        )}

        <p className="text-gray-800 font-semibold">{marker.note}</p>
      </div>

      {marker.dateCreated && (
        <div className="mt-4 text-xs text-gray-400">
          Created: {new Date(marker.dateCreated).toLocaleDateString()}
          {marker.dateUpdated && (
            <span className="ml-2">
              • Updated: {new Date(marker.dateUpdated).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}