import db from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserPayload, AuthRequest, UserRole } from '../types';

export const authService = {
  register: (email: string, password: string, name: string, role: UserRole = UserRole.FIELD_AGENT): Promise<User> => {
    return new Promise((resolve, reject) => {
      const hashedPassword = bcrypt.hashSync(password, 10);
      db.run(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, name, role],
        function (err) {
          if (err) {
            reject(new Error('Email already exists or invalid data'));
          } else {
            resolve({ id: this.lastID, email, password: hashedPassword, name, role, createdAt: new Date().toISOString() });
          }
        }
      );
    });
  },

  login: (email: string, password: string): Promise<{ token: string; user: UserPayload }> => {
    return new Promise((resolve, reject) => {
      db.get('SELECT id, email, password, name, role FROM users WHERE email = ?', [email], (err, user: any) => {
        if (err || !user) {
          return reject(new Error('User not found'));
        }

        if (!bcrypt.compareSync(password, user.password)) {
          return reject(new Error('Invalid password'));
        }

        const token = jwt.sign(
          { id: user.id, email: user.email, name: user.name, role: user.role },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '7d' }
        );

        resolve({
          token,
          user: { id: user.id, email: user.email, name: user.name, role: user.role }
        });
      });
    });
  },

  getUser: (userId: number): Promise<User> => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user: any) => {
        if (err || !user) {
          reject(new Error('User not found'));
        } else {
          resolve(user as User);
        }
      });
    });
  }
};
