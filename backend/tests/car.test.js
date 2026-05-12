import request from 'supertest';
import app from '../server.js';

let token;
let carId;

beforeAll(async () => {
  await request(app)
    .post('/api/auth/register')
    .send({
      name: "Test User",
      email: "car-owner@example.com",
      password: "Password123",
      role: "landlord"
    });

  const login = await request(app)
    .post('/api/auth/login')
    .send({
      email: "car-owner@example.com",
      password: "Password123"
    });

  token = login.body.token;
});

describe('Car APIs', () => {

  test('Create car', async () => {
    const res = await request(app)
      .post('/api/cars')
      .set('Authorization', `Bearer ${token}`)
      .send({
        make: "Toyota",
        model: "Corolla",
        year: 2022,
        vin: "1HGCM82633A000000",
        category: "sedan",
        fuelType: "gasoline",
        transmission: "automatic",
        seats: 5,
        color: "Blue",
        mileage: 1000,
        dailyRate: 100,
        location: {
          city: "New York"
        }
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.isAvailable).toBe(true);
    carId = res.body.data._id;
  });

  test('Create car from landlord multipart form data', async () => {
    const res = await request(app)
      .post('/api/owner/cars')
      .set('Authorization', `Bearer ${token}`)
      .field('make', 'Honda')
      .field('model', 'Civic')
      .field('year', '2024')
      .field('vin', '3HGCM82633A000000')
      .field('category', 'sedan')
      .field('fuelType', 'gasoline')
      .field('transmission', 'automatic')
      .field('seats', '5')
      .field('color', 'White')
      .field('mileage', '250')
      .field('dailyRate', '95')
      .field('status', 'available')
      .field('location[city]', 'Cairo')
      .attach('image', Buffer.from('test-image'), {
        filename: 'car.png',
        contentType: 'image/png'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.location.city).toBe('Cairo');
    expect(res.body.data.isAvailable).toBe(true);
    expect(res.body.data.images[0].url).toContain('data:image/png;base64,');
  });

  test('Create car accepts capitalized values and relaxed VIN letters', async () => {
    const res = await request(app)
      .post('/api/owner/cars')
      .set('Authorization', `Bearer ${token}`)
      .send({
        make: "Kia",
        model: "Rio",
        year: 2024,
        vin: "IOQCM82633A000000",
        category: "SUV",
        fuelType: "Gasoline",
        transmission: "Automatic",
        seats: 5,
        doors: 4,
        color: "Silver",
        mileage: 0,
        dailyRate: 80,
        status: "Available",
        location: {
          city: "Cairo"
        }
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.vin).toBe("IOQCM82633A000000");
    expect(res.body.data.category).toBe("suv");
    expect(res.body.data.fuelType).toBe("gasoline");
    expect(res.body.data.transmission).toBe("automatic");
  });

  test('Get cars', async () => {
    const res = await request(app)
      .get('/api/cars');

    expect(res.statusCode).toBe(200);
  });

  test('Get public cars from standardized API', async () => {
    const res = await request(app)
      .get('/api/public/cars?limit=5');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.limit).toBe(5);
  });

  test('Get owner cars from standardized API', async () => {
    const res = await request(app)
      .get('/api/owner/cars')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('Get car by id', async () => {
    const res = await request(app)
      .get(`/api/cars/${carId}`);

    expect(res.statusCode).toBe(200);
  });
});
