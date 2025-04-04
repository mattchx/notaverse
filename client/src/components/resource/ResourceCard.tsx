import React from 'react';
import { Resource } from '../../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Book, Headphones, FileText, Sparkles } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  showUser?: boolean;
}

const typeIcons = {
  book: <Book className="h-4 w-4" />,
  podcast: <Headphones className="h-4 w-4" />,
  article: <FileText className="h-4 w-4" />,
  course: <Sparkles className="h-4 w-4" />,
};

export default function ResourceCard({ resource, showUser = false }: ResourceCardProps) {
  // Helper to get user initials for avatar
  const getInitials = (name: string | undefined | null) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 flex gap-1 items-center">
            {typeIcons[resource.type as keyof typeof typeIcons]}
            <span className="capitalize">{resource.type}</span>
          </div>
          <span className="text-xs text-gray-500">
            {formatDate(resource.createdAt)}
          </span>
        </div>
        <CardTitle className="text-xl mt-2 line-clamp-1">{resource.name}</CardTitle>
        {resource.author && (
          <CardDescription className="line-clamp-1">By {resource.author}</CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600">
          {resource.sections.length} section{resource.sections.length !== 1 ? 's' : ''}
        </p>
        {resource.sourceUrl && (
          <a 
            href={resource.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline mt-1 block truncate"
            onClick={(e) => e.stopPropagation()}
          >
            Source: {new URL(resource.sourceUrl).hostname}
          </a>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 border-t flex items-center justify-between">
        {showUser && resource.user && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {getInitials(resource.user.name || resource.user.email)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-600 truncate max-w-[120px]">
              {resource.user.name || resource.user.email?.split('@')[0]}
            </span>
          </div>
        )}
        
        <Button variant="outline" size="sm" className="ml-auto" 
                onClick={() => window.location.href = `/resources/${resource.id}`}>
          View
        </Button>
      </CardFooter>
    </Card>
  );
} 