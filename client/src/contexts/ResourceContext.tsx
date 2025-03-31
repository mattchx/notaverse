import React, { createContext, useContext, useReducer } from 'react';
import { MediaItem as Resource, Marker } from '../types';

interface ResourceState {
  resources: Resource[];
  activeResource: Resource | null;
  isLoading: boolean;
  error: string | null;
}

type ResourceAction =
  | { type: 'SET_RESOURCE_LIST'; payload: Resource[] }
  | { type: 'SET_RESOURCE'; payload: Resource }
  | { type: 'CREATE_RESOURCE'; payload: Resource }
  | { type: 'UPDATE_RESOURCE'; payload: Resource }
  | { type: 'DELETE_RESOURCE'; payload: string }
  | { type: 'DELETE_SECTION'; payload: { sectionId: string } }
  | { type: 'DELETE_MARKER'; payload: { sectionId: string; markerId: string } }
  | { type: 'UPDATE_MARKER'; payload: { sectionId: string; marker: Marker } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_RESOURCES' };

const initialState: ResourceState = {
  resources: [],
  activeResource: null,
  isLoading: false,
  error: null,
};

const ResourceContext = createContext<{
  state: ResourceState;
  dispatch: React.Dispatch<ResourceAction>;
} | undefined>(undefined);

function resourceReducer(state: ResourceState, action: ResourceAction): ResourceState {
  switch (action.type) {
    case 'SET_RESOURCE_LIST':
      return {
        ...state,
        resources: action.payload,
        error: null,
      };
    case 'SET_RESOURCE':
      return {
        ...state,
        activeResource: action.payload,
        error: null,
      };
    case 'CREATE_RESOURCE':
      return {
        ...state,
        resources: [action.payload, ...state.resources],
        activeResource: action.payload,
        error: null,
      };
    case 'UPDATE_RESOURCE':
      return {
        ...state,
        resources: state.resources.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
        activeResource: state.activeResource?.id === action.payload.id ? action.payload : state.activeResource,
        error: null,
      };
    case 'DELETE_RESOURCE':
      return {
        ...state,
        resources: state.resources.filter(item => item.id !== action.payload),
        error: null,
      };
    case 'DELETE_SECTION':
      return {
        ...state,
        activeResource: state.activeResource ? {
          ...state.activeResource,
          sections: state.activeResource.sections.filter(section =>
            section.id !== action.payload.sectionId
          )
        } : null,
        error: null,
      };
    case 'DELETE_MARKER':
      return {
        ...state,
        activeResource: state.activeResource ? {
          ...state.activeResource,
          sections: state.activeResource.sections.map(section =>
            section.id === action.payload.sectionId
              ? {
                  ...section,
                  markers: section.markers.filter(marker =>
                    marker.id !== action.payload.markerId
                  )
                }
              : section
          )
        } : null,
        error: null,
      };
    case 'UPDATE_MARKER':
      return {
        ...state,
        activeResource: state.activeResource ? {
          ...state.activeResource,
          sections: state.activeResource.sections.map(section =>
            section.id === action.payload.sectionId
              ? {
                  ...section,
                  markers: section.markers.map(marker =>
                    marker.id === action.payload.marker.id
                      ? action.payload.marker
                      : marker
                  )
                }
              : section
          )
        } : null,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'CLEAR_RESOURCES':
      return initialState;
    default:
      return state;
  }
}

export function ResourceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(resourceReducer, initialState);
  return (
    <ResourceContext.Provider value={{ state, dispatch }}>
      {children}
    </ResourceContext.Provider>
  );
}

export function useResource() {
  const context = useContext(ResourceContext);
  if (context === undefined) {
    throw new Error('useResource must be used within a ResourceProvider');
  }
  return context;
}

export function useActiveResource() {
  const { state } = useResource();
  return state.activeResource;
}

export function useResourceOperations() {
  const { dispatch } = useResource();

  return {
    setResourceList: (resources: Resource[]) => {
      dispatch({ type: 'SET_RESOURCE_LIST', payload: resources });
    },
    setResource: (resource: Resource) => {
      dispatch({ type: 'SET_RESOURCE', payload: resource });
    },
    createResource: (resource: Resource) => {
      dispatch({ type: 'CREATE_RESOURCE', payload: resource });
    },
    clearResources: () => {
      dispatch({ type: 'CLEAR_RESOURCES' });
    },
    setLoading: (loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    },
    setError: (error: string) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    },
    deleteResource: (resourceId: string) => {
      dispatch({ type: 'DELETE_RESOURCE', payload: resourceId });
    },
    updateResource: (resource: Resource) => {
      dispatch({ type: 'UPDATE_RESOURCE', payload: resource });
    },
    deleteSection: (sectionId: string) => {
      dispatch({ type: 'DELETE_SECTION', payload: { sectionId } });
    },
    deleteMarker: (sectionId: string, markerId: string) => {
      dispatch({ type: 'DELETE_MARKER', payload: { sectionId, markerId } });
    },
    updateMarker: (sectionId: string, marker: Marker) => {
      dispatch({ type: 'UPDATE_MARKER', payload: { sectionId, marker } });
    },
  };
}