"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireAuth = void 0;
const supabase_1 = require("../config/supabase");
const env_1 = require("../config/env");

const normalizeRole = (role) => {
    if (!role || typeof role !== 'string') return null;
    const r = role.toLowerCase().trim();
    if (r === 'seller') return 'vendor';
    return r;
};

const resolveUserRole = async (userId, userMetadata, appMetadata) => {
    let role = normalizeRole(appMetadata?.role || userMetadata?.role);
    if (role && role !== 'authenticated') {
        return role;
    }

    try {
        if (supabase_1.supabase) {
            const { data: profile, error } = await supabase_1.supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();
            if (!error && profile?.role) {
                return normalizeRole(profile.role);
            }
        }
    } catch (err) {
        // Log non-sensitive operational error
        console.error('Role resolution error from database');
    }

    return null;
};

const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            if (!token || token.trim() === '' || token === 'undefined' || token === 'null') {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized: Invalid token format'
                });
            }

            if (!supabase_1.supabase) {
                return res.status(500).json({
                    success: false,
                    message: 'Authentication service unavailable'
                });
            }

            const { data: { user } = {}, error } = await supabase_1.supabase.auth.getUser(token);
            if (!error && user) {
                const effectiveRole = await resolveUserRole(user.id, user.user_metadata, user.app_metadata);
                user.role = effectiveRole || 'customer';
                if (!user.user_metadata) user.user_metadata = {};
                user.user_metadata.role = user.role;
                req.user = user;
                return next();
            }

            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Invalid or expired token'
            });
        }

        // Strictly development/test only fallback if explicitly enabled
        const isDevOrTest = process.env.NODE_ENV === 'test' || (!env_1.isProduction && env_1.env.ALLOW_DEV_HEADER_AUTH === 'true');
        if (isDevOrTest) {
            const xUserId = req.headers['x-user-id'];
            if (xUserId) {
                let resolvedRole = null;
                try {
                    if (supabase_1.supabase) {
                        const { data: profile } = await supabase_1.supabase
                            .from('profiles')
                            .select('role')
                            .eq('id', xUserId)
                            .single();
                        if (profile?.role) {
                            resolvedRole = normalizeRole(profile.role);
                        }
                    }
                } catch {}

                if (!resolvedRole && process.env.NODE_ENV === 'test') {
                    resolvedRole = normalizeRole(req.headers['x-user-role']);
                }

                req.user = {
                    id: xUserId,
                    role: resolvedRole || 'customer',
                    user_metadata: { role: resolvedRole || 'customer' }
                };
                return next();
            }
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
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Not logged in'
            });
        }

        const normalizedAllowedRoles = roles.map(r => normalizeRole(r)).filter(Boolean);

        let userRole = req.user.role || normalizeRole(req.user.user_metadata?.role || req.user.app_metadata?.role);

        if (!userRole || userRole === 'authenticated') {
            userRole = await resolveUserRole(req.user.id, req.user.user_metadata, req.user.app_metadata);
        }

        const effectiveRole = normalizeRole(userRole);

        if (!effectiveRole || !normalizedAllowedRoles.includes(effectiveRole)) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Insufficient permissions'
            });
        }

        req.user.role = effectiveRole;
        if (!req.user.user_metadata) req.user.user_metadata = {};
        req.user.user_metadata.role = effectiveRole;
        next();
    };
};
exports.requireRole = requireRole;


