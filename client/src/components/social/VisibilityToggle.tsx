import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { patch } from '../../utils/api';

interface VisibilityToggleProps {
  resourceId: string;
  initialIsPublic: boolean;
  onVisibilityChange?: (isPublic: boolean) => void;
}

interface VisibilityResponse {
  success: boolean;
  isPublic: boolean;
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
      const data = await patch<VisibilityResponse>(`/resources/${resourceId}/visibility`, { 
        isPublic: !isPublic
      });
      
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