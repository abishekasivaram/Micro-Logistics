"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDbHealth = exports.getHealth = void 0;
const supabase_1 = require("../config/supabase");
const getHealth = (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Micro-Logistics API is running'
    });
};
exports.getHealth = getHealth;
const getDbHealth = async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase.from('profiles').select('id').limit(1);
        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Database connection failed',
                error: error.message
            });
        }
        res.status(200).json({
            success: true,
            message: 'Database connection successful'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        });
    }
};
exports.getDbHealth = getDbHealth;
