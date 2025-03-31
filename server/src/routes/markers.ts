import { Router, Request, Response, NextFunction } from 'express';
import { mockDataService } from '../services/mockData.js';
import { ApiError } from '../middleware/errorHandler.js';
import { ApiResponse } from '../types/index.js';
import { Marker, Note } from '../types/resource.js';

export const markerRouter = Router();

// Get all markers
markerRouter.get('/', async (req: Request, res: Response) => {
  const markers = await mockDataService.getMarkers();
  const response: ApiResponse<Marker[]> = {
    success: true,
    data: markers
  };
  res.json(response);
});

// Get marker by ID
markerRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const marker = await mockDataService.getMarkerById(req.params.id);
    
    if (!marker) {
      throw new ApiError(404, 'Marker not found');
    }

    const response: ApiResponse<Marker> = {
      success: true,
      data: marker
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Create new marker
markerRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const markerData = req.body;
    
    // Verify section exists
    const section = await mockDataService.getSectionById(markerData.sectionId);
    if (!section) {
      throw new ApiError(404, 'Section not found');
    }

    const marker = await mockDataService.createMarker(markerData);
    
    const response: ApiResponse<Marker> = {
      success: true,
      data: marker
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// Get marker's notes
markerRouter.get('/:id/notes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notes = await mockDataService.getNotesByMarkerId(req.params.id);
    
    const response: ApiResponse<Note[]> = {
      success: true,
      data: notes
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});