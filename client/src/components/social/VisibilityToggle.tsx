import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Link, Copy, Check, EyeOff, Loader2 } from 'lucide-react';
import { patch } from '../../utils/api';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

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
  const [copySuccess, setCopySuccess] = useState(false);
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
        ? 'Resource is now public and can be shared'
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

  const getShareableLink = () => {
    // Create a shareable link based on the current window location
    const baseUrl = window.location.origin;
    return `${baseUrl}/resources/${resourceId}`;
  };

  const copyToClipboard = async () => {
    const link = getShareableLink();
    try {
      await navigator.clipboard.writeText(link);
      setCopySuccess(true);
      setMessage('Link copied to clipboard');
      
      // Reset copy success after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
        setMessage('');
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      setMessage('Failed to copy link');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (!isPublic) {
    return (
      <div className="flex flex-col">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleVisibility}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Link className="h-4 w-4" />
          )}
          Make Public
        </Button>
        {message && (
          <p className="text-xs mt-1 text-gray-500">{message}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Link className="h-4 w-4" />
            )}
            Share Link
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={copyToClipboard} className="gap-2 cursor-pointer">
            {copySuccess ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            Copy link to clipboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleVisibility} className="gap-2 cursor-pointer text-red-500">
            <EyeOff className="h-4 w-4" />
            Make Private
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {message && (
        <p className="text-xs mt-1 text-gray-500">{message}</p>
      )}
    </div>
  );
} 