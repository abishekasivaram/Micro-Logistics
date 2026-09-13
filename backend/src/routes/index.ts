import { Router } from 'express';
import healthRoutes from './health.routes';
import productRoutes from './product.routes';
import vendorRoutes from './vendor.routes';
import orderRoutes from './order.routes';
import deliveryRoutes from './delivery.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/products', productRoutes);
router.use('/vendors', vendorRoutes);
router.use('/orders', orderRoutes);
router.use('/delivery', deliveryRoutes);

export default router;
