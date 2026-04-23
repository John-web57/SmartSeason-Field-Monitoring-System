import { Request, Response } from 'express';
import { fieldService } from '../services/fieldService';
import { CreateFieldRequest, UpdateFieldRequest, CreateFieldUpdateRequest } from '../types';

export const fieldController = {
  createField: async (req: Request, res: Response) => {
    try {
      const data: CreateFieldRequest = req.body;
      const field = await fieldService.createField(data);
      res.status(201).json(field);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  getField: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const field = await fieldService.getField(parseInt(id));
      const updates = await fieldService.getFieldUpdates(parseInt(id));
      res.json({ field, updates });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },

  getAllFields: async (req: Request, res: Response) => {
    try {
      const fields = await fieldService.getAllFields();
      res.json(fields);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  searchFields: async (req: Request, res: Response) => {
    try {
      const { q, cropType, status, stage } = req.query;
      const query = (q as string) || '';
      const filters = {
        cropType: cropType as string | undefined,
        status: status as string | undefined,
        stage: stage as string | undefined
      };
      const fields = await fieldService.searchFields(query, filters);
      res.json(fields);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getMyFields: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const fields = await fieldService.getFieldsByAgent(req.user.id);
      res.json(fields);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  updateField: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data: UpdateFieldRequest = req.body;
      const field = await fieldService.updateField(parseInt(id), data);
      res.json(field);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  cloneField: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { newName, plantingDate } = req.body;
      if (!newName) {
        return res.status(400).json({ error: 'newName is required' });
      }
      const field = await fieldService.cloneField(parseInt(id), newName, plantingDate);
      res.status(201).json(field);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  recordHarvest: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { yield: yieldValue, harvestDate } = req.body;
      if (yieldValue === undefined) {
        return res.status(400).json({ error: 'yield is required' });
      }
      const field = await fieldService.recordHarvest(parseInt(id), yieldValue, harvestDate);
      res.json(field);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  addFieldUpdate: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { fieldId } = req.params;
      const data: CreateFieldUpdateRequest = req.body;

      const update = await fieldService.addFieldUpdate(parseInt(fieldId), req.user.id, data);
      res.status(201).json(update);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  getAllUpdates: async (req: Request, res: Response) => {
    try {
      const updates = await fieldService.getAllUpdates();
      res.json(updates);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getStatistics: async (req: Request, res: Response) => {
    try {
      const stats = await fieldService.getStatistics();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getAtRiskFields: async (req: Request, res: Response) => {
    try {
      const fields = await fieldService.getAtRiskFields();
      res.json(fields);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getFieldStatusDetails: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const details = await fieldService.getFieldStatusDetails(parseInt(id));
      res.json(details);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
};
