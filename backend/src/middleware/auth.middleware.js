"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireAuth = void 0;
const supabase_1 = require("../config/supabase");
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: No token provided'
            });
        }
        const token = authHeader.split(' ')[1];
        const { data: { user }, error } = await supabase_1.supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Invalid token'
            });
        }
        req.user = user;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.requireAuth = requireAuth;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Not logged in'
            });
        }
        // Example of getting role, might change based on how role is actually stored
        const userRole = req.user.user_metadata?.role || req.user.role;
        if (!roles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Insufficient permissions'
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
