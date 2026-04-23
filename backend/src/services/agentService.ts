import db from '../config/database';

export const agentService = {
  getAllAgents: (): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      db.all("SELECT id, email, name FROM users WHERE role = 'field_agent' ORDER BY name", [], (err, agents) => {
        if (err) {
          reject(new Error('Failed to fetch agents'));
        } else {
          resolve(agents || []);
        }
      });
    });
  },

  getAgentById: (agentId: number): Promise<any> => {
    return new Promise((resolve, reject) => {
      db.get("SELECT id, email, name FROM users WHERE id = ? AND role = 'field_agent'", [agentId], (err, agent) => {
        if (err || !agent) {
          reject(new Error('Agent not found'));
        } else {
          resolve(agent);
        }
      });
    });
  },

  getAgentStatistics: (agentId: number): Promise<any> => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as fieldCount, 
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeCount,
                SUM(CASE WHEN status = 'at_risk' THEN 1 ELSE 0 END) as atRiskCount,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedCount
         FROM fields WHERE assignedAgentId = ?`,
        [agentId],
        (err, stats: any) => {
          if (err) {
            reject(new Error('Failed to fetch agent statistics'));
          } else {
            resolve({
              fieldCount: stats?.fieldCount || 0,
              activeCount: stats?.activeCount || 0,
              atRiskCount: stats?.atRiskCount || 0,
              completedCount: stats?.completedCount || 0
            });
          }
        }
      );
    });
  }
};
