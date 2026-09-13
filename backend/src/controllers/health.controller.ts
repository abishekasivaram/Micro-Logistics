import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getHealth = (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Micro-Logistics API is running'
  });
};

export const getDbHealth = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
};
