"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All order routes require auth
router.use(auth_middleware_1.requireAuth);
router.get('/', order_controller_1.getOrders);
router.get('/:id', order_controller_1.getOrderById);
router.post('/', order_controller_1.createOrder);
router.patch('/:id/status', order_controller_1.updateOrderStatus);
exports.default = router;
