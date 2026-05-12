import request from 'supertest';
import app from '../server.js';

let customerToken;
let landlordToken;
let carId;
let bookingId;

beforeAll(async () => {
  await request(app)
    .post('/api/auth/register')
    .send({
      name: "Booking Owner",
      email: "booking-owner@example.com",
      password: "Password123",
      role: "landlord"
    });

  await request(app)
    .post('/api/auth/register')
    .send({
      name: "Booking Customer",
      email: "booking-customer@example.com",
      password: "Password123",
      role: "user"
    });

  const ownerLogin = await request(app)
    .post('/api/auth/login')
    .send({
      email: "booking-owner@example.com",
      password: "Password123"
    });

  landlordToken = ownerLogin.body.token;

  const customerLogin = await request(app)
    .post('/api/auth/login')
    .send({
      email: "booking-customer@example.com",
      password: "Password123"
    });

  customerToken = customerLogin.body.token;

  const carRes = await request(app)
    .post('/api/cars')
    .set('Authorization', `Bearer ${landlordToken}`)
    .send({
      make: "Toyota",
      model: "Camry",
      year: 2023,
      vin: "2HGCM82633A000000",
      category: "sedan",
      fuelType: "gasoline",
      transmission: "automatic",
      seats: 5,
      color: "Red",
      mileage: 500,
      dailyRate: 150,
      location: {
        city: "Los Angeles"
      }
    });

  if (carRes.statusCode !== 201) {
    throw new Error(`Failed to create car for booking test: ${JSON.stringify(carRes.body)}`);
  }

  carId = carRes.body.data._id;
});

describe('Booking APIs', () => {

  test('Create booking', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        car: carId,
        startDate: "2026-06-01",
        endDate: "2026-06-05",
        pickupLocation: {
          address: "123 Pickup St"
        },
        returnLocation: {
          address: "123 Return St"
        }
      });

    expect(res.statusCode).toBe(201);
    bookingId = res.body.data._id;
  });

  test('Get my bookings', async () => {
    const res = await request(app)
      .get('/api/bookings/my-bookings')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(200);
  });

  test('Create booking with fallback pickup and return location', async () => {
    const res = await request(app)
      .post('/api/private/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        car: carId,
        startDate: "2026-07-01",
        endDate: "2026-07-03",
        insuranceType: "basic"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.pickupLocation.address).toContain("Los Angeles");
    expect(res.body.data.returnLocation.address).toContain("Los Angeles");
  });

  test('Cancel booking', async () => {
    const res = await request(app)
      .put(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        reason: "customer_request"
      });

    expect(res.statusCode).toBe(200);
  });
});
