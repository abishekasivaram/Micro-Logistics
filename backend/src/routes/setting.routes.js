"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const setting_controller_1 = require("../controllers/setting.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");

const router = (0, express_1.Router)();

router.use(auth_middleware_1.requireAuth);
router.use((0, auth_middleware_1.requireRole)(['admin'])); // Only admins can access settings

router.get('/', setting_controller_1.getSettings);
router.put('/', setting_controller_1.updateSettings);

exports.default = router;
