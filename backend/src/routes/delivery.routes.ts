import { Router } from 'express';
import { getBatches, getBatchById, createBatch, assignBatch, updateBatchStatus, getAgents, getAgentById } from '../controllers/delivery.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/agents', requireRole(['admin', 'delivery_partner']), getAgents);
router.get('/agents/:id', requireRole(['admin', 'delivery_partner']), getAgentById);

router.get('/batches', getBatches);
router.get('/batches/:id', getBatchById);
router.post('/batches', requireRole(['admin']), createBatch);
router.post('/batches/:id/assign', requireRole(['admin']), assignBatch);
router.patch('/batches/:id/status', requireRole(['admin', 'delivery_partner']), updateBatchStatus);

export default router;
