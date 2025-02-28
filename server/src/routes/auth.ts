import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { requireAuth } from '../middleware/auth.js';
import type { User } from '../types/auth.js';

const router = Router();

// Mock database for demo - replace with your actual database
const users: User[] = [];

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
  const result = registerSchema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation Error',
      issues: result.error.issues
    });
  }

  const { email, password } = result.data;
  
  // Check if user already exists
  if (users.some(user => user.email === email)) {
    return res.status(400).json({
      error: 'User already exists'
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user: User = {
    id: crypto.randomUUID(),
    email,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  users.push(user);

  // Set session and save
  req.session.userId = user.id;
  req.session.email = user.email;
  await new Promise<void>((resolve, reject) => {
    req.session.save((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  res.status(201).json({
    message: 'User created successfully',
    user: {
      id: user.id,
      email: user.email
    }
  });
});

router.post('/login', async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation Error',
      issues: result.error.issues
    });
  }

  const { email, password } = result.data;
  
  const user = users.find(u => u.email === email);

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

router.get('/me', requireAuth, (req, res) => {
  const user = users.find(u => u.id === req.session.userId);

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
});

export { router as authRouter };