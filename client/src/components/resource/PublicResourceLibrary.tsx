import React, { useState, useEffect, useMemo } from 'react';
import { get as apiGet } from '../../utils/api';
import { Resource, ResourceType } from '../../types';
import ResourceCard from './ResourceCard';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Book, Headphones, FileText, Sparkles, Filter, Clock, Loader } from 'lucide-react';

export default function PublicResourceLibrary() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ResourceType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Fetch public resources on component mount
  useEffect(() => {
    const fetchPublicResources = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiGet<Resource[]>('/resources/public');
        setResources(data);
      } catch (err) {
        console.error('Error fetching public resources:', err);
        setError('Failed to load public resources. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicResources();
  }, []);

  // Filter and sort resources
  const filteredResources = useMemo(() => {
    let result = [...resources];
    
    // Apply type filter
    if (filter !== 'all') {
      result = result.filter(r => r.type === filter);
    }
    
    // Apply sorting
    result = result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    return result;
  }, [resources, filter, sortBy]);

  // Render filter buttons
  const renderFilterButtons = () => {
    const filters = [
      { value: 'all', label: 'All', icon: <Filter className="h-4 w-4" /> },
      { value: 'book', label: 'Books', icon: <Book className="h-4 w-4" /> },
      { value: 'podcast', label: 'Podcasts', icon: <Headphones className="h-4 w-4" /> },
      { value: 'article', label: 'Articles', icon: <FileText className="h-4 w-4" /> },
      { value: 'course', label: 'Courses', icon: <Sparkles className="h-4 w-4" /> },
    ];

    return (
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f.value as ResourceType | 'all')}
            className="gap-1"
          >
            {f.icon}
            {f.label}
          </Button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading public resources...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="pt-6 text-center text-red-500">
          <p>{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <h1 className="text-2xl font-bold">Discover Public Resources</h1>
        
        <div className="flex gap-2 items-center">
          <Button
            variant={sortBy === 'newest' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('newest')}
            className="gap-1"
          >
            <Clock className="h-4 w-4" />
            Newest
          </Button>
          <Button
            variant={sortBy === 'oldest' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('oldest')}
            className="gap-1"
          >
            <Clock className="h-4 w-4" />
            Oldest
          </Button>
        </div>
      </div>
      
      {renderFilterButtons()}
      
      {filteredResources.length === 0 ? (
        <Card className="bg-gray-50">
          <CardContent className="pt-6 text-center text-gray-500">
            <p>No public resources found. Resources will appear here when users make them public.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map(resource => (
            <ResourceCard 
              key={resource.id} 
              resource={resource}
              showUser={true}
            />
          ))}
        </div>
      )}
    </div>
  );
} 