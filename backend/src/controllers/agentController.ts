import { Request, Response } from 'express';
import { agentService } from '../services/agentService';

export const agentController = {
  getAllAgents: async (req: Request, res: Response) => {
    try {
      const agents = await agentService.getAllAgents();
      res.json(agents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getAgentDetails: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const agent = await agentService.getAgentById(parseInt(id));
      const stats = await agentService.getAgentStatistics(parseInt(id));
      res.json({ agent, stats });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },

  getAgentStatistics: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const stats = await agentService.getAgentStatistics(req.user.id);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
