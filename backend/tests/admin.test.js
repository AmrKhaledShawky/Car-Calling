import request from 'supertest';
import app from '../server.js';
import User from '../src/models/User.js';
import bcrypt from 'bcryptjs';

let adminToken;

beforeAll(async () => {
  await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password: "Password123",
    role: "admin"
  });

  const login = await request(app)
    .post('/api/auth/login')
    .send({
      email: "admin@example.com",
      password: "Password123"
    });

  adminToken = login.body.token;
});

describe('Admin APIs', () => {

  test('Get dashboard stats', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
  });

  test('Get all users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
  });
});