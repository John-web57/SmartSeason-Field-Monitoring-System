import { Router } from 'express';
import { agentController } from '../controllers/agentController';
import { authMiddleware, adminMiddleware, fieldAgentMiddleware } from '../middleware/auth';

const router = Router();

// Admins can view all agents
router.get('/', authMiddleware, adminMiddleware, agentController.getAllAgents);
router.get('/stats/my', authMiddleware, fieldAgentMiddleware, agentController.getAgentStatistics);
router.get('/:id', authMiddleware, adminMiddleware, agentController.getAgentDetails);

export default router;
