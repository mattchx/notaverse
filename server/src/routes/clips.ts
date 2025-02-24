import { Router } from 'express';
import { mockDataService } from '../services/mockData.js';
import { ApiError } from '../middleware/errorHandler.js';
import { ApiResponse, Clip, CreateClipDTO } from '../types/index.js';

export const router = Router();

// Get all clips
router.get('/', async (req, res) => {
  const clips = await mockDataService.getClips();
  const response: ApiResponse<Clip[]> = {
    success: true,
    data: clips
  };
  res.json(response);
});

// Get clip by ID
router.get('/:id', async (req, res, next) => {
  try {
    const clip = await mockDataService.getClipById(req.params.id);
    
    if (!clip) {
      throw new ApiError(404, 'Clip not found');
    }

    const response: ApiResponse<Clip> = {
      success: true,
      data: clip
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Create new clip
router.post('/', async (req, res, next) => {
  try {
    const clipData: CreateClipDTO = req.body;
    
    // Verify resource exists
    const resource = await mockDataService.getResourceById(clipData.resourceId);
    if (!resource) {
      throw new ApiError(404, 'Resource not found');
    }

    const clip = await mockDataService.createClip(clipData);
    
    const response: ApiResponse<Clip> = {
      success: true,
      data: clip
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// Get clip's notes
router.get('/:id/notes', async (req, res, next) => {
  try {
    const notes = await mockDataService.getNotesByClipId(req.params.id);
    
    const response: ApiResponse<typeof notes> = {
      success: true,
      data: notes
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});