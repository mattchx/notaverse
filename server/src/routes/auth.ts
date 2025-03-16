import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { requireAuth } from '../middleware/auth.js';
import type { User } from '../types/auth.js';
import { createUser, findUserByEmail, findUserById } from '../db.js';

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
    const result = loginSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation Error',
        issues: result.error.issues
      });
    }

    const { email, password } = result.data;
    
    const user = await findUserByEmail(email);

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Set session data and save
    req.session.userId = user.id;
    req.session.email = user.email;
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
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
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({
        error: 'Logout failed',
        message: err.message
      });
    }
    res.clearCookie('sess');
    res.json({ message: 'Logged out successfully' });
  });
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    // TypeScript type assertion since we know userId exists due to requireAuth
    const userId = req.session.userId as string;
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user data',
      message: 'An error occurred while retrieving user data'
    });
  }
});

export { router as authRouter };