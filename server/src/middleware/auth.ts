import { Request, Response, NextFunction } from 'express';

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('🔐 Auth Middleware Check:', { 
    path: req.path,
    sessionID: req.sessionID,
    hasCookies: !!req.headers.cookie,
    userId: req.session.userId || 'none'
  });
  
  if (!req.session.userId) {
    console.log('❌ Auth failed: No userId in session');
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }
  
  console.log('✅ Auth successful');
  next();
};