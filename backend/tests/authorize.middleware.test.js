import { jest } from '@jest/globals';
import {
  adminAccess,
  authorize,
  landlordAccess,
  ownerAccess
} from '../src/middleware/authorize.middleware.js';

const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authorize middleware', () => {
  test('allows access for a matching role', () => {
    const req = { user: { role: 'admin' } };
    const res = createResponse();
    const next = jest.fn();

    authorize('admin')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('allows owner role requests for landlord users', () => {
    const req = { user: { role: 'landlord' } };
    const res = createResponse();
    const next = jest.fn();

    authorize('owner', 'admin')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('blocks authenticated users without an allowed role', () => {
    const req = { user: { role: 'user' } };
    const res = createResponse();
    const next = jest.fn();

    authorize('landlord', 'admin')(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'User role user is not authorized to access this route'
    });
  });

  test('blocks requests without an authenticated user', () => {
    const req = {};
    const res = createResponse();
    const next = jest.fn();

    authorize('admin')(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'User not authenticated'
    });
  });

  test('exports role-specific middleware helpers', () => {
    const adminReq = { user: { role: 'admin' } };
    const landlordReq = { user: { role: 'landlord' } };
    const adminRes = createResponse();
    const landlordRes = createResponse();
    const ownerRes = createResponse();
    const adminNext = jest.fn();
    const landlordNext = jest.fn();
    const ownerNext = jest.fn();

    adminAccess(adminReq, adminRes, adminNext);
    landlordAccess(landlordReq, landlordRes, landlordNext);
    ownerAccess(landlordReq, ownerRes, ownerNext);

    expect(adminNext).toHaveBeenCalledTimes(1);
    expect(landlordNext).toHaveBeenCalledTimes(1);
    expect(ownerNext).toHaveBeenCalledTimes(1);
  });
});
