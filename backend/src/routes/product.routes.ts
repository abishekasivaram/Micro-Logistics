import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct } from '../controllers/product.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', requireAuth, requireRole(['admin', 'vendor']), createProduct);
router.put('/:id', requireAuth, requireRole(['admin', 'vendor']), updateProduct);

export default router;
