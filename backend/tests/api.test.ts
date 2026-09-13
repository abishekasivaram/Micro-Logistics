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

// Mock Auth Middleware to bypass token checks in basic routing tests
vi.mock('../src/middleware/auth.middleware', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    requireAuth: vi.fn((req, res, next) => {
      req.user = { id: 'u1', role: 'admin' };
      next();
    }),
    requireRole: vi.fn(() => (req: any, res: any, next: any) => next())
  };
});

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

  it('GET /api/v1/orders should return orders (auth mocked)', async () => {
    const response = await request(app).get('/api/v1/orders');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('GET /api/v1/delivery/batches should return batches', async () => {
    const response = await request(app).get('/api/v1/delivery/batches');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
