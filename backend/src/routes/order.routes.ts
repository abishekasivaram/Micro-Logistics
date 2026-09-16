import { Router } from 'express';
import { getOrders, getOrderById, createOrder, updateOrderStatus } from '../controllers/order.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// All order routes require auth
router.use(requireAuth);

router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.patch('/:id/status', updateOrderStatus);

export default router;
