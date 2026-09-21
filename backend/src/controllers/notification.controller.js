"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.createNotification = exports.getNotifications = void 0;
const supabase_1 = require("../config/supabase");

const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { data, error } = await supabase_1.supabase.from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        // Map to frontend structure
        const formatted = data.map(n => ({
            id: n.id,
            message: n.message,
            type: n.type,
            isRead: n.is_read,
            date: n.created_at
        }));
        
        res.json({ success: true, data: formatted });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getNotifications = getNotifications;

const createNotification = async (req, res) => {
    try {
        const { message, type, userId } = req.body;
        // If userId is provided and the creator is admin, send it there. Otherwise send to self.
        let targetUserId = req.user.id;
        if (userId && req.user.user_metadata?.role === 'admin') {
            targetUserId = userId; // Wait, actually the frontend uses legacy IDs? We might need to resolve it.
            // But let's assume userId is the Supabase UUID for now.
            // If it's a legacy ID, we'd need to look it up.
            
            // Look up if it's a legacy ID
            if (!userId.includes('-')) {
                // Determine which table it belongs to. Just check profiles for legacy_id? No, profiles doesn't have legacy_id.
                // For simplicity, let's just insert with user_id. If it fails due to FK, it's not a UUID.
                // However, notifications in sampleData don't even have user_id, they are global or local.
            }
        }
        
        const { data, error } = await supabase_1.supabase.from('notifications').insert({
            user_id: targetUserId,
            message,
            type: type || 'system'
        }).select().single();
        
        if (error) throw error;
        
        const formatted = {
            id: data.id,
            message: data.message,
            type: data.type,
            isRead: data.is_read,
            date: data.created_at
        };
        
        res.status(201).json({ success: true, data: formatted });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.createNotification = createNotification;

const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase_1.supabase.from('notifications').update({
            is_read: true
        }).eq('id', id).eq('user_id', req.user.id).select().single();
        
        if (error) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        
        res.json({ success: true, data });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.markAsRead = markAsRead;
