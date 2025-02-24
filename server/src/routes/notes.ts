import { Router } from 'express';
import { mockDataService } from '../services/mockData.js';
import { ApiError } from '../middleware/errorHandler.js';
import { ApiResponse, Note, CreateNoteDTO } from '../types/index.js';

export const router = Router();

// Get all notes
router.get('/', async (req, res) => {
  const notes = await mockDataService.getNotes();
  const response: ApiResponse<Note[]> = {
    success: true,
    data: notes
  };
  res.json(response);
});

// Get note by ID
router.get('/:id', async (req, res, next) => {
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
router.post('/', async (req, res, next) => {
  try {
    const noteData: CreateNoteDTO = req.body;
    
    // Verify resource exists
    const resource = await mockDataService.getResourceById(noteData.resourceId);
    if (!resource) {
      throw new ApiError(404, 'Resource not found');
    }

    // Verify clip exists if clipId is provided
    if (noteData.clipId) {
      const clip = await mockDataService.getClipById(noteData.clipId);
      if (!clip) {
        throw new ApiError(404, 'Clip not found');
      }
      // Verify clip belongs to the specified resource
      if (clip.resourceId !== noteData.resourceId) {
        throw new ApiError(400, 'Clip does not belong to the specified resource');
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
router.get('/resource/:resourceId', async (req, res, next) => {
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

// Get notes by clip ID
router.get('/clip/:clipId', async (req, res, next) => {
  try {
    const notes = await mockDataService.getNotesByClipId(req.params.clipId);
    
    const response: ApiResponse<Note[]> = {
      success: true,
      data: notes
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});