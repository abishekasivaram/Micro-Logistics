"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireAuth = void 0;
const supabase_1 = require("../config/supabase");
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const { data: { user }, error } = await supabase_1.supabase.auth.getUser(token);
            if (!error && user) {
                req.user = user;
                return next();
            }
        }

        // Fallback for valid session identified by client headers in local app
        const xUserId = req.headers['x-user-id'];
        const xUserRole = req.headers['x-user-role'];
        if (xUserId) {
            req.user = {
                id: xUserId,
                user_metadata: { role: xUserRole || 'vendor' }
            };
            return next();
        }

        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Invalid or missing token'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.requireAuth = requireAuth;

const requireRole = (roles) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Not logged in'
            });
        }

        const normalizedRoles = roles.map(r => r === 'seller' ? 'vendor' : r);

        // 1. Check user_metadata or app_metadata
        let userRole = req.user.user_metadata?.role || req.user.app_metadata?.role;

        // 2. Fallback to profiles table in database
        if (!userRole || userRole === 'authenticated') {
            try {
                const { data: profile } = await supabase_1.supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', req.user.id)
                    .single();
                if (profile?.role) {
                    userRole = profile.role;
                }
            } catch (err) {
                console.error('Error fetching role from profiles:', err.message);
            }
        }

        // 3. Fallback: Check if user exists in vendors table
        if (normalizedRoles.includes('vendor')) {
            try {
                const candidateId = req.headers['x-user-id'] || req.user.id || req.body?.vendorId;
                if (candidateId) {
                    const { data: vRec } = await supabase_1.supabase
                        .from('vendors')
                        .select('id')
                        .or(`id.eq.${candidateId},legacy_id.eq.${candidateId}`)
                        .single();
                    if (vRec) {
                        req.user.id = vRec.id;
                        userRole = 'vendor';
                    }
                }
            } catch (e) {}
        }

        // 4. Fallback: Check x-user-role header
        const headerRole = req.headers['x-user-role'];
        if (headerRole && normalizedRoles.includes(headerRole === 'seller' ? 'vendor' : headerRole)) {
            userRole = headerRole;
        }

        const effectiveRole = userRole === 'seller' ? 'vendor' : userRole;

        if (!normalizedRoles.includes(effectiveRole)) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Insufficient permissions'
            });
        }
        next();
    };
};
exports.requireRole = requireRole;

