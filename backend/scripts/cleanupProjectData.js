import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Car from '../models/Car.js';
import Booking from '../models/Booking.js';

dotenv.config();

const args = new Set(process.argv.slice(2));
const shouldDeleteAllUsers = args.has('--all-users');
const confirmed = args.has('--yes');

if (!confirmed) {
  console.log('This script deletes project data from the configured MongoDB database.');
  console.log('Run with --yes to confirm. Add --all-users if you also want to delete admin accounts.');
  process.exit(0);
}

const runCleanup = async () => {
  try {
    await connectDB();

    const bookingResult = await Booking.deleteMany({});
    const carResult = await Car.deleteMany({});
    const userQuery = shouldDeleteAllUsers ? {} : { role: { $ne: 'admin' } };
    const userResult = await User.deleteMany(userQuery);

    console.log('Cleanup completed successfully.');
    console.log(`Deleted bookings: ${bookingResult.deletedCount || 0}`);
    console.log(`Deleted cars: ${carResult.deletedCount || 0}`);
    console.log(`Deleted users: ${userResult.deletedCount || 0}`);
    console.log(shouldDeleteAllUsers ? 'Admin users were deleted too.' : 'Admin users were kept.');
  } catch (error) {
    console.error('Cleanup failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

runCleanup();
