import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';

dotenv.config();

const email = process.argv[2]?.trim()?.toLowerCase();
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error('Usage: node scripts/setUserPassword.js user@example.com NewPassword123');
  process.exit(1);
}

await connectDB();

try {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    console.error(`No user found for ${email}`);
    process.exit(1);
  }

  user.password = newPassword;
  await user.save();

  console.log(`Password updated successfully for ${user.email}`);
  process.exit(0);
} catch (error) {
  console.error('Failed to update password:', error.message);
  process.exit(1);
}
