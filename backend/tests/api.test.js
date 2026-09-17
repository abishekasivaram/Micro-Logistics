import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app';

// Mock Supabase client
vi.mock('../src/config/supabase', () => {
  const mockQuery = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { id: 'uuid-1', legacy_id: 'l1', name: 'Test' }, error: null }),
    then: vi.fn((resolve) => resolve({ data: [{ id: 'uuid-1', legacy_id: 'l1', name: 'Test' }], error: null }))
  };

  return {
    supabase: {
      from: vi.fn().mockReturnValue(mockQuery),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1', role: 'admin' } }, error: null })
      }
    }
  };
});

import * as authMiddleware from '../src/middleware/auth.middleware';

// Spy on the middleware instead of vi.mock
vi.spyOn(authMiddleware, 'requireAuth').mockImplementation((req, res, next) => {
  req.user = { id: 'u1', role: 'admin' };
  next();
});
vi.spyOn(authMiddleware, 'requireRole').mockImplementation(() => (req, res, next) => next());

describe('Phase 2 APIs', () => {
  it('GET /api/v1/products should return products', async () => {
    const response = await request(app).get('/api/v1/products');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('GET /api/v1/vendors should return vendors', async () => {
    const response = await request(app).get('/api/v1/vendors');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('GET /api/v1/orders should require auth', async () => {
    const response = await request(app).get('/api/v1/orders');
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/v1/delivery/batches should require auth', async () => {
    const response = await request(app).get('/api/v1/delivery/batches');
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
