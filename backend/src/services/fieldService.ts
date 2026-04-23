import db from '../config/database';
import { Field, FieldStatus, FieldStage, CreateFieldRequest, UpdateFieldRequest, FieldUpdate, CreateFieldUpdateRequest } from '../types';

const stageProgression = {
  [FieldStage.PLANTED]: 0,
  [FieldStage.GROWING]: 1,
  [FieldStage.READY]: 2,
  [FieldStage.HARVESTED]: 3
};

const validateStageProgression = (currentStage: FieldStage, newStage: FieldStage): boolean => {
  return stageProgression[newStage] >= stageProgression[currentStage];
};

const calculateFieldStatus = (
  stage: FieldStage,
  expectedHarvestDate?: string,
  plantingDate?: string,
  lastUpdateDate?: string,
  createdAt?: string
): FieldStatus => {
  // Harvested fields are always completed
  if (stage === FieldStage.HARVESTED) {
    return FieldStatus.COMPLETED;
  }

  // Ready stage fields are at risk (need harvesting)
  if (stage === FieldStage.READY) {
    return FieldStatus.AT_RISK;
  }

  // Check for overdue harvest (READY stage past expected date)
  if (expectedHarvestDate) {
    const expected = new Date(expectedHarvestDate);
    const today = new Date();
    if (today > expected) {
      return FieldStatus.AT_RISK; // Overdue harvest
    }
  }

  // Check if field is progressing too slowly (stuck in PLANTED for extended period)
  if (stage === FieldStage.PLANTED && plantingDate) {
    const planted = new Date(plantingDate);
    const today = new Date();
    const daysSincePlanting = Math.floor((today.getTime() - planted.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSincePlanting > 30) {
      return FieldStatus.AT_RISK;
    }
  }

  // Check if field hasn't been updated in a long time
  if (lastUpdateDate || createdAt) {
    const lastActivity = lastUpdateDate ? new Date(lastUpdateDate) : new Date(createdAt || '');
    const today = new Date();
    const daysSinceUpdate = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceUpdate > 14) {
      return FieldStatus.AT_RISK;
    }
  }

  // Check if GROWING stage is approaching harvest deadline
  if (stage === FieldStage.GROWING && expectedHarvestDate) {
    const expected = new Date(expectedHarvestDate);
    const today = new Date();
    const daysUntilHarvest = Math.ceil((expected.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilHarvest <= 7 && daysUntilHarvest > 0) {
      return FieldStatus.AT_RISK;
    }
  }

  return FieldStatus.ACTIVE;
};

const getFieldStatusReason = (
  status: FieldStatus,
  stage: FieldStage,
  expectedHarvestDate?: string,
  plantingDate?: string,
  lastUpdateDate?: string
): { reason: string; severity: 'low' | 'medium' | 'high' } => {
  if (status === FieldStatus.COMPLETED) {
    return { reason: 'Field has been harvested', severity: 'low' };
  }

  if (status === FieldStatus.AT_RISK) {
    if (stage === FieldStage.READY) {
      if (expectedHarvestDate && new Date() > new Date(expectedHarvestDate)) {
        return { reason: 'Harvest is overdue - immediate action required', severity: 'high' };
      }
      return { reason: 'Ready for harvest - schedule harvesting', severity: 'medium' };
    }

    if (stage === FieldStage.PLANTED && plantingDate) {
      const daysSincePlanting = Math.floor(
        (new Date().getTime() - new Date(plantingDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSincePlanting > 30) {
        return { reason: `Stuck in Planted stage for ${daysSincePlanting} days - check field condition`, severity: 'high' };
      }
    }

    if (stage === FieldStage.GROWING && expectedHarvestDate) {
      const daysUntilHarvest = Math.ceil(
        (new Date(expectedHarvestDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilHarvest <= 7 && daysUntilHarvest > 0) {
        return { reason: `Harvest deadline in ${daysUntilHarvest} days - prepare for harvesting`, severity: 'medium' };
      }
    }

    if (lastUpdateDate) {
      const daysSinceUpdate = Math.floor(
        (new Date().getTime() - new Date(lastUpdateDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceUpdate > 14) {
        return { reason: `No updates for ${daysSinceUpdate} days - field may need attention`, severity: 'high' };
      }
    }

    return { reason: 'Field requires attention', severity: 'medium' };
  }

  return { reason: 'Field is progressing normally', severity: 'low' };
};

const calculateExpectedHarvestDate = (plantingDate: string, cropType: string): string => {
  const planting = new Date(plantingDate);
  const daysToMaturity: Record<string, number> = {
    'Corn': 110,
    'Soybeans': 120,
    'Wheat': 140,
    'Barley': 120,
    'Oats': 100
  };
  
  const days = daysToMaturity[cropType] || 120;
  const harvest = new Date(planting);
  harvest.setDate(harvest.getDate() + days);
  return harvest.toISOString().split('T')[0];
};

export const fieldService = {
  createField: (data: CreateFieldRequest): Promise<Field> => {
    return new Promise((resolve, reject) => {
      const expectedHarvestDate = data.expectedHarvestDate || calculateExpectedHarvestDate(data.plantingDate, data.cropType);
      const status = calculateFieldStatus(FieldStage.PLANTED, expectedHarvestDate);
      const assignedAgentId = data.assignedAgentId ?? null;
      db.run(
        'INSERT INTO fields (name, cropType, plantingDate, currentStage, status, assignedAgentId, latitude, longitude, acreage, description, expectedHarvestDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [data.name, data.cropType, data.plantingDate, FieldStage.PLANTED, status, assignedAgentId, data.latitude || null, data.longitude || null, data.acreage || null, data.description || null, expectedHarvestDate],
        function (err) {
          if (err) {
            reject(new Error('Failed to create field'));
          } else {
            resolve({
              id: this.lastID,
              ...data,
              assignedAgentId,
              currentStage: FieldStage.PLANTED,
              status,
              expectedHarvestDate,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        }
      );
    });
  },

  getField: (fieldId: number): Promise<Field> => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM fields WHERE id = ?', [fieldId], (err, field: Field | undefined) => {
        if (err || !field) {
          reject(new Error('Field not found'));
        } else {
          resolve(field);
        }
      });
    });
  },

  getAllFields: (): Promise<Field[]> => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM fields ORDER BY createdAt DESC', [], (err, fields: Field[] = []) => {
        if (err) {
          reject(new Error('Failed to fetch fields'));
        } else {
          resolve(fields);
        }
      });
    });
  },

  getFieldsByAgent: (agentId: number): Promise<Field[]> => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM fields WHERE assignedAgentId = ? ORDER BY createdAt DESC', [agentId], (err, fields: Field[] = []) => {
        if (err) {
          reject(new Error('Failed to fetch fields'));
        } else {
          resolve(fields);
        }
      });
    });
  },

  searchFields: (query: string, filters?: { cropType?: string; status?: string; stage?: string }): Promise<Field[]> => {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM fields WHERE (name LIKE ? OR description LIKE ? OR cropType LIKE ?)';
      const params: any[] = [`%${query}%`, `%${query}%`, `%${query}%`];

      if (filters?.cropType) {
        sql += ' AND cropType = ?';
        params.push(filters.cropType);
      }
      if (filters?.status) {
        sql += ' AND status = ?';
        params.push(filters.status);
      }
      if (filters?.stage) {
        sql += ' AND currentStage = ?';
        params.push(filters.stage);
      }

      sql += ' ORDER BY createdAt DESC';

      db.all(sql, params, (err, fields: Field[] = []) => {
        if (err) {
          reject(new Error('Search failed'));
        } else {
          resolve(fields);
        }
      });
    });
  },

  updateField: (fieldId: number, data: UpdateFieldRequest): Promise<Field> => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM fields WHERE id = ?', [fieldId], (err, field: any) => {
        if (err || !field) {
          return reject(new Error('Field not found'));
        }

        const stage = data.stage || field.currentStage;
        const expectedHarvestDate = data.expectedHarvestDate || field.expectedHarvestDate;
        const status = data.stage ? calculateFieldStatus(data.stage, expectedHarvestDate) : field.status;
        const name = data.name || field.name;
        const cropType = data.cropType || field.cropType;
        const assignedAgentId = data.assignedAgentId !== undefined ? data.assignedAgentId : field.assignedAgentId;
        const latitude = data.latitude !== undefined ? data.latitude : field.latitude;
        const longitude = data.longitude !== undefined ? data.longitude : field.longitude;
        const acreage = data.acreage !== undefined ? data.acreage : field.acreage;
        const description = data.description !== undefined ? data.description : field.description;
        const harvestDate = data.harvestDate || field.harvestDate;
        const fieldYield = data.yield !== undefined ? data.yield : field.yield;

        db.run(
          'UPDATE fields SET name = ?, cropType = ?, currentStage = ?, status = ?, assignedAgentId = ?, latitude = ?, longitude = ?, acreage = ?, description = ?, expectedHarvestDate = ?, harvestDate = ?, yield = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
          [name, cropType, stage, status, assignedAgentId, latitude, longitude, acreage, description, expectedHarvestDate, harvestDate, fieldYield, fieldId],
          (err) => {
            if (err) {
              reject(new Error('Failed to update field'));
            } else {
              resolve({
                id: fieldId,
                name,
                cropType,
                plantingDate: field.plantingDate,
                currentStage: stage,
                status,
                assignedAgentId,
                latitude,
                longitude,
                acreage,
                description,
                expectedHarvestDate,
                harvestDate,
                yield: fieldYield,
                createdAt: field.createdAt,
                updatedAt: new Date().toISOString()
              });
            }
          }
        );
      });
    });
  },

  cloneField: (fieldId: number, newName: string, plantingDate?: string): Promise<Field> => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM fields WHERE id = ?', [fieldId], (err, field: any) => {
        if (err || !field) {
          return reject(new Error('Field not found'));
        }

        const newPlantingDate = plantingDate || new Date().toISOString().split('T')[0];
        const newExpectedHarvestDate = calculateExpectedHarvestDate(newPlantingDate, field.cropType);
        const status = calculateFieldStatus(FieldStage.PLANTED, newExpectedHarvestDate);

        db.run(
          'INSERT INTO fields (name, cropType, plantingDate, currentStage, status, assignedAgentId, latitude, longitude, acreage, description, expectedHarvestDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [newName, field.cropType, newPlantingDate, FieldStage.PLANTED, status, null, field.latitude, field.longitude, field.acreage, field.description, newExpectedHarvestDate],
          function (err) {
            if (err) {
              reject(new Error('Failed to clone field'));
            } else {
              resolve({
                id: this.lastID,
                name: newName,
                cropType: field.cropType,
                plantingDate: newPlantingDate,
                currentStage: FieldStage.PLANTED,
                status,
                assignedAgentId: null,
                latitude: field.latitude,
                longitude: field.longitude,
                acreage: field.acreage,
                description: field.description,
                expectedHarvestDate: newExpectedHarvestDate,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            }
          }
        );
      });
    });
  },

  recordHarvest: (fieldId: number, yield_value: number, harvestDate?: string): Promise<Field> => {
    return new Promise((resolve, reject) => {
      const harvest = harvestDate || new Date().toISOString().split('T')[0];
      db.run(
        'UPDATE fields SET currentStage = ?, status = ?, harvestDate = ?, yield = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [FieldStage.HARVESTED, FieldStatus.COMPLETED, harvest, yield_value, fieldId],
        (err) => {
          if (err) {
            reject(new Error('Failed to record harvest'));
          } else {
            fieldService.getField(fieldId).then(resolve).catch(reject);
          }
        }
      );
    });
  },

  addFieldUpdate: (fieldId: number, agentId: number, data: CreateFieldUpdateRequest): Promise<FieldUpdate> => {
    return new Promise((resolve, reject) => {
      // First, get the current field to validate stage progression
      db.get('SELECT * FROM fields WHERE id = ?', [fieldId], (err, field: any) => {
        if (err || !field) {
          return reject(new Error('Field not found'));
        }

        // Validate stage progression
        if (!validateStageProgression(field.currentStage, data.stage)) {
          return reject(new Error(`Cannot move from ${field.currentStage} to ${data.stage}. Stages must progress forward.`));
        }

        db.run(
          'INSERT INTO fieldUpdates (fieldId, agentId, stage, notes) VALUES (?, ?, ?, ?)',
          [fieldId, agentId, data.stage, data.notes],
          function (err) {
            if (err) {
              reject(new Error('Failed to add field update'));
            } else {
              const status = calculateFieldStatus(data.stage);
              db.run(
                'UPDATE fields SET currentStage = ?, status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
                [data.stage, status, fieldId],
                (err) => {
                  if (err) {
                    reject(new Error('Failed to update field'));
                  } else {
                    resolve({
                      id: this.lastID,
                      fieldId,
                      agentId,
                      stage: data.stage,
                      notes: data.notes,
                      createdAt: new Date().toISOString()
                    });
                  }
                }
              );
            }
          }
        );
      });
    });
  },

  getFieldUpdates: (fieldId: number): Promise<FieldUpdate[]> => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT fu.*, u.name as agentName, f.name as fieldName 
         FROM fieldUpdates fu 
         JOIN users u ON fu.agentId = u.id 
         JOIN fields f ON fu.fieldId = f.id 
         WHERE fu.fieldId = ? ORDER BY fu.createdAt DESC`,
        [fieldId],
        (err, updates: any[]) => {
          if (err) {
            reject(new Error('Failed to fetch field updates'));
          } else {
            resolve(updates || []);
          }
        }
      );
    });
  },

  getAllUpdates: (): Promise<FieldUpdate[]> => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT fu.*, u.name as agentName, f.name as fieldName 
         FROM fieldUpdates fu 
         JOIN users u ON fu.agentId = u.id 
         JOIN fields f ON fu.fieldId = f.id 
         ORDER BY fu.createdAt DESC`,
        [],
        (err, updates: any[]) => {
          if (err) {
            reject(new Error('Failed to fetch updates'));
          } else {
            resolve(updates || []);
          }
        }
      );
    });
  },

  getStatistics: (): Promise<{ total: number; byStage: Record<string, number>; byStatus: Record<string, number>; averageAcreage: number; totalAcreage: number }> => {
    return new Promise((resolve, reject) => {
      db.all('SELECT currentStage, status, COUNT(*) as count, SUM(acreage) as totalAc, AVG(acreage) as avgAc FROM fields GROUP BY currentStage, status', [], (err, rows: any[]) => {
        if (err) {
          reject(new Error('Failed to fetch statistics'));
        } else {
          const byStage: Record<string, number> = {};
          const byStatus: Record<string, number> = {};
          let total = 0;
          let totalAcreage = 0;
          let totalAcreageSum = 0;
          let countWithAcreage = 0;

          rows.forEach((row) => {
            byStage[row.currentStage] = (byStage[row.currentStage] || 0) + row.count;
            byStatus[row.status] = (byStatus[row.status] || 0) + row.count;
            total += row.count;
            if (row.totalAc) {
              totalAcreageSum += row.totalAc;
              countWithAcreage += row.count;
            }
          });

          resolve({
            total,
            byStage,
            byStatus,
            totalAcreage: Math.round(totalAcreageSum * 10) / 10,
            averageAcreage: countWithAcreage > 0 ? Math.round((totalAcreageSum / countWithAcreage) * 10) / 10 : 0
          });
        }
      });
    });
  },

  getAtRiskFields: (): Promise<(Field & { statusReason: string; severity: 'low' | 'medium' | 'high' })[]> => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM fields WHERE status = ?`,
        [FieldStatus.AT_RISK],
        (err, fields: any[]) => {
          if (err) {
            reject(new Error('Failed to fetch at-risk fields'));
          } else {
            const fieldsWithReasons = fields.map((field) => {
              const statusInfo = getFieldStatusReason(
                field.status,
                field.currentStage,
                field.expectedHarvestDate,
                field.plantingDate,
                field.updatedAt
              );
              return {
                ...field,
                statusReason: statusInfo.reason,
                severity: statusInfo.severity
              };
            });
            resolve(fieldsWithReasons);
          }
        }
      );
    });
  },

  getFieldStatusDetails: (fieldId: number): Promise<{ field: Field; status: FieldStatus; statusReason: string; severity: 'low' | 'medium' | 'high' }> => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM fields WHERE id = ?', [fieldId], (err, field: any) => {
        if (err || !field) {
          reject(new Error('Field not found'));
        } else {
          const statusInfo = getFieldStatusReason(
            field.status,
            field.currentStage,
            field.expectedHarvestDate,
            field.plantingDate,
            field.updatedAt
          );
          resolve({
            field,
            status: field.status,
            statusReason: statusInfo.reason,
            severity: statusInfo.severity
          });
        }
      });
    });
  }
};
