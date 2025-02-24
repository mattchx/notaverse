import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ApiResponse } from '../types/index.js';

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err);

  if (err instanceof ApiError) {
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      error: err.message
    };
    res.status(err.statusCode).json(response);
    return;
  }

  const response: ApiResponse<null> = {
    success: false,
    data: null,
    error: 'Internal Server Error'
  };
  
  res.status(500).json(response);
};