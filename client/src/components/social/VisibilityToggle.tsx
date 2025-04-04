import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface VisibilityToggleProps {
  resourceId: string;
  initialIsPublic: boolean;
  onVisibilityChange?: (isPublic: boolean) => void;
}

export function VisibilityToggle({ 
  resourceId, 
  initialIsPublic,
  onVisibilityChange 
}: VisibilityToggleProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [isLoading, setIsLoading] = useState(false);

  const toggleVisibility = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/resources/${resourceId}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isPublic: !isPublic })
      });

      if (!response.ok) {
        throw new Error('Failed to update visibility');
      }

      const data = await response.json();
      setIsPublic(data.isPublic);
      
      if (onVisibilityChange) {
        onVisibilityChange(data.isPublic);
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={toggleVisibility}
      disabled={isLoading}
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isPublic ? (
        <Eye className="h-4 w-4" />
      ) : (
        <EyeOff className="h-4 w-4" />
      )}
      {isPublic ? 'Public' : 'Private'}
    </Button>
  );
} 