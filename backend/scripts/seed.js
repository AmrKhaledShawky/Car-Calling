import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Car from '../models/Car.js';
import connectDB from '../config/database.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const users = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user',
    phone: '+1234567890',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001'
    }
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'landlord',
    phone: '+1234567891',
    address: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210'
    },
    isVerifiedLandlord: true,
    businessName: 'Premium Car Rentals'
  },
  {
    name: 'Admin User',
    email: 'admin@carcalling.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1234567892'
  }
];

const cars = [
  {
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    vin: '1HGBH41JXMN109186',
    licensePlate: 'ABC123',
    category: 'sedan',
    fuelType: 'gasoline',
    transmission: 'automatic',
    seats: 5,
    doors: 4,
    color: 'Silver',
    mileage: 15000,
    features: ['air-conditioning', 'bluetooth', 'backup-camera', 'cruise-control'],
    dailyRate: 45,
    location: {
      address: '123 Main St, New York, NY 10001',
      city: 'New York',
      state: 'NY',
      zipCode: '10001'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800',
        isPrimary: true,
        alt: 'Toyota Camry 2022'
      }
    ]
  },
  {
    make: 'BMW',
    model: 'X5',
    year: 2023,
    vin: 'WBAFY420X0L123456',
    licensePlate: 'BMW001',
    category: 'suv',
    fuelType: 'gasoline',
    transmission: 'automatic',
    seats: 5,
    doors: 4,
    color: 'Black',
    mileage: 5000,
    features: ['air-conditioning', 'heating', 'bluetooth', 'gps-navigation', 'leather-seats', 'heated-seats', 'sunroof'],
    dailyRate: 120,
    location: {
      address: '456 Luxury Ave, Beverly Hills, CA 90210',
      city: 'Beverly Hills',
      state: 'CA',
      zipCode: '90210'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
        isPrimary: true,
        alt: 'BMW X5 2023'
      }
    ]
  },
  {
    make: 'Tesla',
    model: 'Model 3',
    year: 2023,
    vin: '5YJ3E1EA5JF123456',
    licensePlate: 'TSL001',
    category: 'sedan',
    fuelType: 'electric',
    transmission: 'automatic',
    seats: 5,
    doors: 4,
    color: 'Pearl White',
    mileage: 8000,
    features: ['air-conditioning', 'bluetooth', 'gps-navigation', 'apple-carplay', 'android-auto', 'autopilot'],
    dailyRate: 85,
    location: {
      address: '789 Tech Blvd, San Francisco, CA 94105',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
        isPrimary: true,
        alt: 'Tesla Model 3 2023'
      }
    ]
  }
];

const seedDB = async () => {
  try {
    // Drop collections to remove old indexes
    try {
      await User.collection.drop();
    } catch (err) {
      // Collection doesn't exist yet, that's OK
    }
    try {
      await Car.collection.drop();
    } catch (err) {
      // Collection doesn't exist yet, that's OK
    }

    console.log('🗑️  Cleared existing data');

    // Create users
    const createdUsers = await User.create(users);
    console.log('👥 Created users');

    // Assign cars to landlords
    const landlord = createdUsers.find(user => user.role === 'landlord');
    cars.forEach(car => {
      car.owner = landlord._id;
    });

    // Create cars
    await Car.create(cars);
    console.log('🚗 Created cars');

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Sample Data:');
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Cars: ${cars.length}`);
    console.log('\n🔐 Test Accounts:');
    console.log('   User: john@example.com / password123');
    console.log('   Landlord: jane@example.com / password123');
    console.log('   Admin: admin@carcalling.com / admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder only if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDB().catch(console.error);
}