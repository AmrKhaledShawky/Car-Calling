import mongoose from 'mongoose';
import { pathToFileURL } from 'url';

import connectDB from '../config/database.js';
import User from '../models/User.js';

const [name, email, password, role = 'user'] = process.argv.slice(2);

const printUsageAndExit = () => {
  console.error('Usage: node src/scripts/createTestUser.js "Name" email@example.com Password123 [user|landlord|admin]');
  process.exit(1);
};

const createUser = async () => {
  if (!name || !email || !password || !['user', 'landlord', 'admin'].includes(role)) {
    printUsageAndExit();
  }

  try {
    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`User already exists: ${email}`);
      return;
    }

    await User.create({ name, email, password, role });
    console.log(`User created successfully: ${email}`);
  } catch (error) {
    console.error('Error creating user:', error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createUser();
}
