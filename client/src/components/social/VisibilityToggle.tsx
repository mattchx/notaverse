import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { patch } from '../../utils/api';
import { Switch } from '../ui/switch';

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
  const [message, setMessage] = useState('');

  const toggleVisibility = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      const data = await patch<VisibilityResponse>(`/resources/${resourceId}/visibility`, { 
        isPublic: !isPublic
      });
      
      setIsPublic(data.isPublic);
      
      if (onVisibilityChange) {
        onVisibilityChange(data.isPublic);
      }
      
      setMessage(data.isPublic 
        ? 'Resource is now public'
        : 'Resource is now private');
        
    } catch (error) {
      console.error('Error toggling visibility:', error);
      setMessage('Failed to update visibility');
    } finally {
      setIsLoading(false);
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <Switch
          checked={isPublic}
          onCheckedChange={toggleVisibility}
          disabled={isLoading}
        />
        <span className="text-sm flex items-center gap-1">
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : isPublic ? (
            <>
              <Eye className="h-3 w-3 text-green-500" />
              <span className="text-green-600">Public</span>
            </>
          ) : (
            <>
              <EyeOff className="h-3 w-3 text-gray-500" />
              <span className="text-gray-600">Private</span>
            </>
          )}
        </span>
      </div>
      
      {message && (
        <p className="text-xs mt-1 text-gray-500">{message}</p>
      )}
    </div>
  );
} 