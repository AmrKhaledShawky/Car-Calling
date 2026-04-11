import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Car from '../models/Car.js';
import Booking from '../models/Booking.js';
import connectDB from '../config/database.js';

// Load environment variables
dotenv.config({ path: '../.env' });

/**
 * This script performs a sample booking creation directly in the database.
 * It is intended for testing the Booking model, pre-save hooks, and 
 * verifying that entries appear correctly in MongoDB Atlas.
 */
const runTestBooking = async () => {
  try {
    // 1. Connect to Database
    await connectDB();
    console.log('📡 Connected to MongoDB for testing...');

    // 2. Find required data
    const cars = await Car.find();
    if (cars.length === 0) {
      console.log('❌ No cars found in database. Please run "npm run seed" first.');
      process.exit(1);
    }
    const selectedCar = cars[0];
    console.log(`🚗 Selected Car: ${selectedCar.make} ${selectedCar.model} (${selectedCar._id})`);

    const users = await User.find({ role: 'user' });
    if (users.length === 0) {
      console.log('❌ No regular users found. Please run "npm run seed" first.');
      process.exit(1);
    }
    const customer = users[0];
    console.log(`👤 Customer: ${customer.name} (${customer._id})`);

    const landlord = await User.findById(selectedCar.owner);
    if (!landlord) {
      console.log('❌ Car owner not found.');
      process.exit(1);
    }
    console.log(`🏠 Owner: ${landlord.name} (${landlord._id})`);

    // 3. Prepare dates (starting tomorrow, for 3 days)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 4);

    const duration = 3;
    const dailyRate = selectedCar.dailyRate || 50;
    const subtotal = dailyRate * duration;
    const tax = subtotal * 0.1;
    const totalAmount = subtotal + tax;

    // 4. Create Booking
    const testBooking = new Booking({
      customer: customer._id,
      car: selectedCar._id,
      owner: landlord._id,
      startDate,
      endDate,
      duration,
      dailyRate,
      subtotal,
      tax,
      totalAmount,
      pickupLocation: {
        address: selectedCar.location.address || '123 Test St, Test City',
        coordinates: { latitude: 0, longitude: 0 }
      },
      returnLocation: {
        address: selectedCar.location.address || '123 Test St, Test City',
        coordinates: { latitude: 0, longitude: 0 }
      },
      status: 'pending',
      paymentStatus: 'pending',
      source: 'api_test'
    });

    // 5. Save and Verify
    await testBooking.save();
    console.log('\n✅ TEST BOOKING CREATED SUCCESSFULLY!');
    console.log('------------------------------------');
    console.log(`ID:        ${testBooking._id}`);
    console.log(`Ref:       ${testBooking.bookingReference}`);
    console.log(`Status:    ${testBooking.status}`);
    console.log(`Dates:     ${testBooking.startDate.toDateString()} to ${testBooking.endDate.toDateString()}`);
    console.log(`Total:     $${testBooking.totalAmount}`);
    console.log('------------------------------------');

    console.log(`\n🔗 You can now find this entry in Atlas:`);
    console.log(`   Collection: test/bookings`);
    console.log(`   Filter: {"_id": ObjectId("${testBooking._id}")}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ TEST BOOKING FAILED:', error);
    process.exit(1);
  }
};

export default runTestBooking;
