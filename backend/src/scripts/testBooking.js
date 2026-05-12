import mongoose from 'mongoose';

import connectDB from '../config/database.js';
import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import User from '../models/User.js';
import { buildFallbackLocationAddress, roundCurrency } from '../services/booking/booking.utils.js';

const [customerId, carId, startDateValue, endDateValue] = process.argv.slice(2);

const printUsageAndExit = () => {
  console.error('Usage: node src/scripts/testBooking.js <customerId> <carId> <startDate> <endDate>');
  process.exit(1);
};

const runTestBooking = async () => {
  if (!customerId || !carId || !startDateValue || !endDateValue) {
    printUsageAndExit();
  }

  try {
    await connectDB();

    const [customer, selectedCar] = await Promise.all([
      User.findById(customerId),
      Car.findById(carId)
    ]);

    if (!customer) {
      throw new Error('Customer not found');
    }

    if (!selectedCar) {
      throw new Error('Car not found');
    }

    const startDate = new Date(startDateValue);
    const endDate = new Date(endDateValue);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
      throw new Error('Provide a valid date range where endDate is after startDate');
    }

    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const dailyRate = selectedCar.getDiscountedRate(duration);
    const subtotal = roundCurrency(dailyRate * duration);
    const tax = roundCurrency(subtotal * 0.1);
    const address = buildFallbackLocationAddress(selectedCar);

    const testBooking = await Booking.create({
      customer: customer._id,
      car: selectedCar._id,
      owner: selectedCar.owner,
      startDate,
      endDate,
      duration,
      dailyRate,
      subtotal,
      tax,
      totalAmount: roundCurrency(subtotal + tax),
      pickupLocation: { address },
      returnLocation: { address },
      status: 'pending',
      paymentStatus: 'pending',
      source: 'api'
    });

    console.log(`Booking created successfully: ${testBooking._id}`);
  } catch (error) {
    console.error('Test booking failed:', error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
};

runTestBooking();
