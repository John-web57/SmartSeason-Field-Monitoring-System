import db from './database';
import bcrypt from 'bcryptjs';
import { UserRole } from '../types';

export const initializeSampleData = async () => {
  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      // Check if admin already exists
      db.get('SELECT id FROM users WHERE email = ?', ['admin@smartseason.com'], (err, row: any) => {
        if (err) {
          console.error('Error checking existing admin:', err);
          reject(err);
        } else if (!row) {
          // Create sample admin user
          const hashedPassword = bcrypt.hashSync('admin123', 10);
          db.run(
            'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
            ['admin@smartseason.com', hashedPassword, 'Admin Coordinator', UserRole.ADMIN],
            function(err) {
              if (err) {
                console.error('Error creating admin:', err);
                reject(err);
              } else {
                console.log('Sample admin user created');
                createSampleFieldAgents(this.lastID as number);
              }
            }
          );
        } else {
          console.log('Admin user already exists');
          createSampleFieldAgents(row.id);
        }
      });
    });

    function createSampleFieldAgents(adminId: number) {
      const agents: Array<{ email: string; name: string; id: number | null }> = [
        { email: 'agent1@smartseason.com', name: 'John Field', id: null },
        { email: 'agent2@smartseason.com', name: 'Sarah Crops', id: null }
      ];

      let agentsCreated = 0;
      agents.forEach((agent) => {
        db.get('SELECT id FROM users WHERE email = ?', [agent.email], (err, row: any) => {
          if (err) {
            console.error('Error checking agent:', err);
          } else if (!row) {
            const hashedPassword = bcrypt.hashSync('agent123', 10);
            db.run(
              'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
              [agent.email, hashedPassword, agent.name, UserRole.FIELD_AGENT],
              function(err) {
                if (err) {
                  console.error('Error creating agent:', err);
                } else {
                  agent.id = this.lastID as number;
                  console.log(`Sample field agent ${agent.name} created`);
                }
                agentsCreated++;
                if (agentsCreated === agents.length) {
                  createSampleFields(agents);
                }
              }
            );
          } else {
            agent.id = row.id;
            agentsCreated++;
            if (agentsCreated === agents.length) {
              createSampleFields(agents);
            }
          }
        });
      });
    }

    function createSampleFields(agents: any[]) {
      const fields = [
        {
          name: 'North Field A',
          cropType: 'Corn',
          plantingDate: '2025-04-01',
          currentStage: 'growing',
          assignedAgentId: agents[0]?.id || null,
          latitude: 41.8781,
          longitude: -87.6298,
          acreage: 45.5,
          description: 'Main corn field, south-facing slope with good drainage. Previous yield: 165 bu/acre'
        },
        {
          name: 'South Field B',
          cropType: 'Soybeans',
          plantingDate: '2025-04-15',
          currentStage: 'growing',
          assignedAgentId: agents[1]?.id || null,
          latitude: 41.8720,
          longitude: -87.6400,
          acreage: 32.0,
          description: 'Secondary soybean field with irrigation system. Rotation from corn.'
        },
        {
          name: 'East Field C',
          cropType: 'Wheat',
          plantingDate: '2025-03-20',
          currentStage: 'ready',
          assignedAgentId: agents[0]?.id || null,
          latitude: 41.8850,
          longitude: -87.6200,
          acreage: 28.75,
          description: 'Winter wheat field, mature and ready for harvest within 2 weeks.',
          expectedHarvestDate: '2025-06-05'
        }
      ];

      let fieldsCreated = 0;
      fields.forEach((field) => {
        db.get('SELECT id FROM fields WHERE name = ?', [field.name], (err, row) => {
          if (err) {
            console.error('Error checking field:', err);
          } else if (!row) {
            db.run(
              'INSERT INTO fields (name, cropType, plantingDate, currentStage, assignedAgentId, status, latitude, longitude, acreage, description, expectedHarvestDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [field.name, field.cropType, field.plantingDate, field.currentStage, field.assignedAgentId, 'active', field.latitude, field.longitude, field.acreage, field.description, field.expectedHarvestDate || null],
              function(err) {
                if (err) {
                  console.error('Error creating field:', err);
                } else {
                  console.log(`Sample field ${field.name} created`);
                }
                fieldsCreated++;
                if (fieldsCreated === fields.length) {
                  resolve();
                }
              }
            );
          } else {
            fieldsCreated++;
            if (fieldsCreated === fields.length) {
              resolve();
            }
          }
        });
      });
    }
  });
};
