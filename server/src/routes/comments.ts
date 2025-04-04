import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../db/config.js';
import { comments, markers } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';
import { ApiResponse } from '../types/index.js';
import { Comment, CreateCommentDTO } from '../types/resource.js';

export const commentRouter = Router();

// Validation schema for creating a comment
const createCommentSchema = z.object({
  markerId: z.string().uuid(),
  content: z.string().min(1).max(2000)
});

// Get comments for a marker
commentRouter.get('/marker/:markerId', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { markerId } = req.params;
    
    // Check if marker exists
    const marker = await db.query.markers.findFirst({
      where: eq(markers.id, markerId)
    });
    
    if (!marker) {
      throw new ApiError(404, 'Marker not found');
    }
    
    // Get all comments for this marker
    const markerComments = await db.query.comments.findMany({
      where: eq(comments.markerId, markerId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      },
      orderBy: comments.createdAt
    });
    
    const response: ApiResponse<Comment[]> = {
      success: true,
      data: markerComments as Comment[]
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Create a comment for a marker
commentRouter.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = createCommentSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        issues: result.error.issues
      });
    }
    
    const { markerId, content } = result.data;
    
    // Check if marker exists
    const marker = await db.query.markers.findFirst({
      where: eq(markers.id, markerId)
    });
    
    if (!marker) {
      throw new ApiError(404, 'Marker not found');
    }
    
    // TypeScript assertion since we have requireAuth middleware
    const userId = req.session.userId as string;
    
    // Create the comment
    const newComment = await db.insert(comments).values({
      id: crypto.randomUUID(),
      markerId,
      userId,
      content,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    // Fetch the comment with user info
    const commentWithUser = await db.query.comments.findFirst({
      where: eq(comments.id, newComment[0].id),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      }
    });
    
    const response: ApiResponse<Comment> = {
      success: true,
      data: commentWithUser as Comment
    };
    
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// Delete a comment
commentRouter.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId as string;
    
    // Find the comment
    const comment = await db.query.comments.findFirst({
      where: eq(comments.id, id)
    });
    
    if (!comment) {
      throw new ApiError(404, 'Comment not found');
    }
    
    // Check if user owns the comment
    if (comment.userId !== userId) {
      throw new ApiError(403, 'Not authorized to delete this comment');
    }
    
    // Delete the comment
    await db.delete(comments).where(eq(comments.id, id));
    
    const response: ApiResponse<null> = {
      success: true,
      data: null
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Update a comment
commentRouter.put('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId as string;
    const { content } = req.body;
    
    if (!content || typeof content !== 'string' || content.length < 1) {
      throw new ApiError(400, 'Content is required');
    }
    
    // Find the comment
    const comment = await db.query.comments.findFirst({
      where: eq(comments.id, id)
    });
    
    if (!comment) {
      throw new ApiError(404, 'Comment not found');
    }
    
    // Check if user owns the comment
    if (comment.userId !== userId) {
      throw new ApiError(403, 'Not authorized to update this comment');
    }
    
    // Update the comment
    await db.update(comments)
      .set({
        content,
        updatedAt: new Date()
      })
      .where(eq(comments.id, id));
    
    // Get updated comment with user info
    const updatedComment = await db.query.comments.findFirst({
      where: eq(comments.id, id),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      }
    });
    
    const response: ApiResponse<Comment> = {
      success: true,
      data: updatedComment as Comment
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
}); 