"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = exports.getSettings = void 0;
const supabase_1 = require("../config/supabase");

const getSettings = async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase.from('system_settings').select('*').limit(1).single();
        
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows returned
        
        const settings = data || {
            maxGroupDistance: 8.0,
            maxOrdersPerBatch: 4,
            defaultAgentCapacity: 5,
            minCompatibilityScore: 70
        };
        
        if (data) {
            settings.maxGroupDistance = data.max_group_distance;
            settings.maxOrdersPerBatch = data.max_orders_per_batch;
            settings.defaultAgentCapacity = data.default_agent_capacity;
            settings.minCompatibilityScore = data.min_compatibility_score;
        }

        res.json({ success: true, data: settings });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getSettings = getSettings;

const updateSettings = async (req, res) => {
    try {
        const updates = req.body;
        
        // Ensure there is at least one row
        const { data: existing } = await supabase_1.supabase.from('system_settings').select('id').limit(1).single();
        
        let result;
        const payload = {
            max_group_distance: updates.maxGroupDistance,
            max_orders_per_batch: updates.maxOrdersPerBatch,
            default_agent_capacity: updates.defaultAgentCapacity,
            min_compatibility_score: updates.minCompatibilityScore
        };
        
        if (existing) {
            result = await supabase_1.supabase.from('system_settings')
                .update(payload)
                .eq('id', existing.id)
                .select()
                .single();
        } else {
            result = await supabase_1.supabase.from('system_settings')
                .insert(payload)
                .select()
                .single();
        }
        
        if (result.error) throw result.error;
        
        const formatted = {
            maxGroupDistance: result.data.max_group_distance,
            maxOrdersPerBatch: result.data.max_orders_per_batch,
            defaultAgentCapacity: result.data.default_agent_capacity,
            minCompatibilityScore: result.data.min_compatibility_score
        };
        
        res.json({ success: true, data: formatted });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateSettings = updateSettings;
