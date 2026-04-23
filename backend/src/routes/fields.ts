import { Router } from 'express';
import { fieldController } from '../controllers/fieldController';
import { authMiddleware, adminMiddleware, fieldAgentMiddleware } from '../middleware/auth';

const router = Router();

// All authenticated users can view fields
router.get('/', authMiddleware, fieldController.getAllFields);
router.get('/search', authMiddleware, fieldController.searchFields);
router.get('/updates/all', authMiddleware, adminMiddleware, fieldController.getAllUpdates);
router.get('/statistics', authMiddleware, adminMiddleware, fieldController.getStatistics);
router.get('/at-risk', authMiddleware, adminMiddleware, fieldController.getAtRiskFields);
router.get('/my-fields', authMiddleware, fieldAgentMiddleware, fieldController.getMyFields);
router.get('/status/:id', authMiddleware, fieldController.getFieldStatusDetails);
router.get('/:id', authMiddleware, fieldController.getField);

// Only admins can create and update fields
router.post('/', authMiddleware, adminMiddleware, fieldController.createField);
router.patch('/:id', authMiddleware, adminMiddleware, fieldController.updateField);
router.post('/:id/clone', authMiddleware, adminMiddleware, fieldController.cloneField);
router.post('/:id/harvest', authMiddleware, adminMiddleware, fieldController.recordHarvest);

// Field agents can add updates to their assigned fields
router.post('/:fieldId/updates', authMiddleware, fieldAgentMiddleware, fieldController.addFieldUpdate);

export default router;
