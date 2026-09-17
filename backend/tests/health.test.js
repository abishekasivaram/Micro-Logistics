import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app';

vi.mock('../src/config/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: [{ id: 'test' }], error: null }),
    auth: {
      getUser: vi.fn()
    }
  }
}));

describe('Health API', () => {
  it('GET /api/v1/health should return success', async () => {
    const response = await request(app).get('/api/v1/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Micro-Logistics API is running'
    });
  });

  it('GET /api/v1/health/db should return success (mocked)', async () => {
    const response = await request(app).get('/api/v1/health/db');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Database connection successful'
    });
  });
});
