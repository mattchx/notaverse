import { Router, Request, Response, NextFunction } from 'express';
import { mockDataService } from '../services/mockData.js';
import { ApiError } from '../middleware/errorHandler.js';
import { ApiResponse } from '../types/index.js';
import { Note, CreateNoteDTO } from '../types/resource.js';

export const noteRouter = Router();

// Get all notes
noteRouter.get('/', async (req: Request, res: Response) => {
  const notes = await mockDataService.getNotes();
  const response: ApiResponse<Note[]> = {
    success: true,
    data: notes
  };
  res.json(response);
});

// Get note by ID
noteRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const note = await mockDataService.getNoteById(req.params.id);
    
    if (!note) {
      throw new ApiError(404, 'Note not found');
    }

    const response: ApiResponse<Note> = {
      success: true,
      data: note
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Create new note
noteRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const noteData = req.body;
    
    if (!req.session.userId) {
      throw new ApiError(401, 'User not logged in');
    }
    
    // Add userId to noteData
    noteData.userId = req.session.userId;
    
    // Verify resource exists
    const resource = await mockDataService.getResourceById(noteData.resourceId);
    if (!resource) {
      throw new ApiError(404, 'Resource not found');
    }

    // Verify marker exists if markerId is provided
    if (noteData.markerId) {
      const marker = await mockDataService.getMarkerById(noteData.markerId);
      if (!marker) {
        throw new ApiError(404, 'Marker not found');
      }
      
      // Get section to verify resource relationship
      const section = await mockDataService.getSectionById(marker.sectionId);
      if (!section || section.resourceId !== noteData.resourceId) {
        throw new ApiError(400, 'Marker does not belong to the specified resource');
      }
    }

    const note = await mockDataService.createNote(noteData);
    
    const response: ApiResponse<Note> = {
      success: true,
      data: note
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// Get notes by resource ID
noteRouter.get('/resource/:resourceId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notes = await mockDataService.getNotesByResourceId(req.params.resourceId);
    
    const response: ApiResponse<Note[]> = {
      success: true,
      data: notes
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Get notes by marker ID
noteRouter.get('/marker/:markerId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notes = await mockDataService.getNotesByMarkerId(req.params.markerId);
    
    const response: ApiResponse<Note[]> = {
      success: true,
      data: notes
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});