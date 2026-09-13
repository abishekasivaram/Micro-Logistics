import { Router } from 'express';
import { getVendors, getVendorById, updateVendor } from '../controllers/vendor.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getVendors);
router.get('/:id', getVendorById);
router.put('/:id', requireAuth, requireRole(['admin', 'vendor']), updateVendor);

export default router;
