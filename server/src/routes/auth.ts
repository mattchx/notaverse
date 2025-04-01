import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { requireAuth } from '../middleware/auth.js';
import type { User } from '../types/auth.js';
import { createUser, findUserByEmail, findUserById } from '../db/users.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const registerSchema = loginSchema.extend({
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

router.post('/register', async (req, res) => {
  try {
    const result = registerSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation Error',
        issues: result.error.issues
      });
    }

    const { email, password } = result.data;
    
    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userData: Omit<User, 'createdAt' | 'updatedAt'> = {
      id: crypto.randomUUID(),
      email,
      password: hashedPassword,
    };

    await createUser(userData);

    // Set session and save
    req.session.userId = userData.id;
    req.session.email = userData.email;
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: userData.id,
        email: userData.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration'
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    console.log('🔑 Login request received:', { 
      email: req.body.email,
      headers: req.headers,
      secure: req.secure
    });
    
    const result = loginSchema.safeParse(req.body);
    
    if (!result.success) {
      console.log('❌ Login validation failed:', result.error.issues);
      return res.status(400).json({
        error: 'Validation Error',
        issues: result.error.issues
      });
    }

    const { email, password } = result.data;
    
    const user = await findUserByEmail(email);
    console.log('👤 User lookup result:', user ? 'User found' : 'User not found');

    if (!user || !await bcrypt.compare(password, user.password)) {
      console.log('❌ Invalid credentials');
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Set session data
    req.session.userId = user.id;
    req.session.email = user.email;
    
    // Log session before saving
    console.log('🔐 Setting session:', { 
      userId: user.id,
      sessionID: req.sessionID,
      cookie: req.session.cookie
    });
    
    // Save session
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          console.error('❌ Session save error:', err);
          reject(err);
        } else {
          console.log('✅ Session saved successfully');
          resolve();
        }
      });
    });

    res.json({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
});

router.post('/logout', (req, res) => {
  console.log('🚪 Logout request received', { 
    sessionID: req.sessionID,
    userId: req.session.userId 
  });
  
  if (!req.session.userId) {
    console.log('⚠️ Logout called when not logged in');
    return res.status(200).json({ message: 'Already logged out' });
  }
  
  req.session.destroy(err => {
    if (err) {
      console.error('❌ Logout error:', err);
      return res.status(500).json({
        error: 'Logout failed',
        message: err.message
      });
    }
    
    // Get cookie settings from the session configuration
    const isProduction = process.env.NODE_ENV === 'production';
    
    console.log('✅ Session destroyed successfully, clearing cookie');
    
    // Clear the cookie using same settings as session config
    res.clearCookie('sess', {
      path: '/',
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'lax' : 'lax'
    });
    
    res.json({ message: 'Logged out successfully' });
  });
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    console.log('🔍 Auth check request received', { 
      sessionID: req.sessionID,
      userId: req.session.userId,
      cookies: req.headers.cookie
    });
    
    // TypeScript type assertion since we know userId exists due to requireAuth
    const userId = req.session.userId as string;
    const user = await findUserById(userId);

    if (!user) {
      console.log('❌ User not found for ID:', userId);
      return res.status(404).json({
        error: 'User not found'
      });
    }

    console.log('✅ User authenticated:', { id: user.id, email: user.email });
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user data',
      message: 'An error occurred while retrieving user data'
    });
  }
});

// Diagnostic route to help debug cookie/session issues
router.get('/status', (req, res) => {
  console.log('📊 Status check request received', {
    sessionID: req.sessionID,
    cookies: req.headers.cookie || 'No cookies',
    userId: req.session.userId || 'Not authenticated',
    headers: {
      origin: req.headers.origin,
      host: req.headers.host,
      referer: req.headers.referer,
    },
    secure: req.secure,
    protocol: req.protocol
  });
  
  res.json({
    authenticated: !!req.session.userId,
    sessionID: req.sessionID,
    cookiesPresent: !!req.headers.cookie,
    env: process.env.NODE_ENV || 'development',
  });
});

export { router as authRouter };