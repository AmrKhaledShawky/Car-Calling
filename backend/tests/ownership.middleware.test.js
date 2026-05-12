import { jest } from '@jest/globals';
import {
  ownsResource,
  validateOwnership
} from '../src/middleware/ownership.middleware.js';

const createModel = (resource) => ({
  findById: jest.fn().mockResolvedValue(resource)
});

const runMiddleware = async (middleware, req) => {
  const next = jest.fn();

  await middleware(req, {}, next);

  return next;
};

describe('ownership middleware', () => {
  test('validates generic ownership against configured owner fields', async () => {
    const resource = { owner: 'user-1' };
    const model = createModel(resource);
    const req = {
      params: { id: 'resource-1' },
      user: { id: 'user-1', role: 'landlord' }
    };

    const next = await runMiddleware(validateOwnership({ model }), req);

    expect(model.findById).toHaveBeenCalledWith('resource-1');
    expect(req.resource).toBe(resource);
    expect(next).toHaveBeenCalledWith();
  });

  test('supports booking ownership through customer or owner fields', async () => {
    const resource = { customer: 'customer-1', owner: 'owner-1' };

    expect(ownsResource(resource, { id: 'customer-1' }, ['customer', 'owner'])).toBe(true);
    expect(ownsResource(resource, { id: 'owner-1' }, ['customer', 'owner'])).toBe(true);
    expect(ownsResource(resource, { id: 'stranger-1' }, ['customer', 'owner'])).toBe(false);
  });

  test('allows admins when admin bypass is enabled', async () => {
    const resource = { owner: 'owner-1' };
    const model = createModel(resource);
    const req = {
      params: { id: 'resource-1' },
      user: { id: 'admin-1', role: 'admin' }
    };

    const next = await runMiddleware(validateOwnership({ model }), req);

    expect(req.resource).toBe(resource);
    expect(next).toHaveBeenCalledWith();
  });

  test('blocks non-owners', async () => {
    const model = createModel({ owner: 'owner-1' });
    const req = {
      params: { id: 'resource-1' },
      user: { id: 'stranger-1', role: 'user' }
    };

    const next = await runMiddleware(validateOwnership({ model }), req);
    const error = next.mock.calls[0][0];

    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('Not authorized to access this resource');
  });
});
