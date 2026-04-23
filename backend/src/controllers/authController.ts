import { Request, Response } from 'express';
import { authService } from '../services/authService';

export const authController = {
  register: async (req: Request, res: Response) => {
    try {
      const { email, password, name, role } = req.body;
      
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password, and name are required' });
      }

      const user = await authService.register(email, password, name, role);
      res.status(201).json({ message: 'User registered successfully', user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const { token, user } = await authService.login(email, password);
      res.json({ token, user });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  },

  getProfile: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      res.json({ user: req.user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
