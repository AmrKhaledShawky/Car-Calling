import mongoose from 'mongoose';
import { pathToFileURL } from 'url';

import connectDB from '../config/database.js';
import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import User from '../models/User.js';

const runSeed = async () => {
  try {
    await connectDB({ serverSelectionTimeoutMS: 10000 });

    await Promise.all([
      Booking.createIndexes(),
      Car.createIndexes(),
      User.createIndexes()
    ]);

    console.log('No demo data was inserted.');
    console.log('Database indexes are ready. Use npm run reset-data to clear all users, cars, and bookings.');
  } catch (error) {
    console.error('Seed task failed:', error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runSeed().catch((error) => {
    console.error('Seed task failed:', error.message);
    process.exitCode = 1;
  });
}
