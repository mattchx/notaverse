import { Router } from 'express';
import { mockDataService } from '../services/mockData.js';
import { ApiError } from '../middleware/errorHandler.js';
import { ApiResponse, Resource, CreateResourceDTO } from '../types/index.js';

export const router = Router();

// Get all resources
router.get('/', async (req, res) => {
  const resources = await mockDataService.getResources();
  const response: ApiResponse<Resource[]> = {
    success: true,
    data: resources
  };
  res.json(response);
});

// Get resource by ID
router.get('/:id', async (req, res, next) => {
  try {
    const resource = await mockDataService.getResourceById(req.params.id);
    
    if (!resource) {
      throw new ApiError(404, 'Resource not found');
    }

    const response: ApiResponse<Resource> = {
      success: true,
      data: resource
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Create new resource
router.post('/', async (req, res, next) => {
  try {
    const resourceData: CreateResourceDTO = req.body;
    const resource = await mockDataService.createResource(resourceData);
    
    const response: ApiResponse<Resource> = {
      success: true,
      data: resource
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// Get resource's clips
router.get('/:id/clips', async (req, res, next) => {
  try {
    const clips = await mockDataService.getClipsByResourceId(req.params.id);
    
    const response: ApiResponse<typeof clips> = {
      success: true,
      data: clips
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Get resource's notes
router.get('/:id/notes', async (req, res, next) => {
  try {
    const notes = await mockDataService.getNotesByResourceId(req.params.id);
    
    const response: ApiResponse<typeof notes> = {
      success: true,
      data: notes
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});