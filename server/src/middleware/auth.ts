import { Request, Response, NextFunction } from 'express';

// Extend the Express Request type with our custom properties
declare module 'express' {
  interface Request {
    isAuthenticated?: boolean;
  }
}

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

// Optional authentication middleware - allows guest access but sets authentication status
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('🔓 Optional Auth Middleware Check:', { 
    path: req.path,
    sessionID: req.sessionID,
    hasCookies: !!req.headers.cookie,
    userId: req.session.userId || 'none'
  });
  
  // Just pass through, setting authenticated status
  if (req.session.userId) {
    console.log('✅ User is authenticated');
    // We'll use this property to determine if the user is authenticated in route handlers
    req.isAuthenticated = true;
  } else {
    console.log('👁️ Guest access');
    req.isAuthenticated = false;
  }
  
  next();
};