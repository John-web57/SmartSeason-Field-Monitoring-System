import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { initializeSampleData } from './config/seed';
import authRoutes from './routes/auth';
import fieldRoutes from './routes/fields';
import agentRoutes from './routes/agents';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/agents', agentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use(errorHandler);

// Initialize sample data and start server
const startServer = async () => {
  try {
    await initializeSampleData();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log('\nDemo Credentials:');
      console.log('Admin: admin@smartseason.com / admin123');
      console.log('Agent 1: agent1@smartseason.com / agent123');
      console.log('Agent 2: agent2@smartseason.com / agent123');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

export default app;

if (require.main === module) {
  startServer();
}
