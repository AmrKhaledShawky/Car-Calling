import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';

dotenv.config();

const email = process.argv[2]?.trim()?.toLowerCase();

if (!email) {
  console.error('Usage: node scripts/promoteToAdmin.js user@example.com');
  process.exit(1);
}

await connectDB();

try {
  const user = await User.findOneAndUpdate(
    { email },
    {
      role: 'admin',
      permissions: [
        'manage-users',
        'manage-cars',
        'manage-bookings',
        'view-analytics',
        'manage-admins'
      ]
    },
    { new: true }
  );

  if (!user) {
    console.error(`No user found for ${email}`);
    process.exit(1);
  }

  console.log(`Promoted ${user.email} to admin successfully.`);
  process.exit(0);
} catch (error) {
  console.error('Failed to promote user to admin:', error.message);
  process.exit(1);
}
