# Car Calling Backend API

A comprehensive backend API for the Car Calling car rental platform built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication & Authorization** - JWT-based auth with role-based access control
- **Car Management** - Complete CRUD operations for car listings
- **Booking System** - Full booking lifecycle management
- **Admin Dashboard** - Administrative controls and analytics
- **Security** - Rate limiting, input validation, CORS, helmet
- **File Upload** - Image upload support with Cloudinary
- **Email Notifications** - Automated email system
- **Payment Integration** - Stripe payment processing

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **File Storage**: Cloudinary
- **Payments**: Stripe
- **Email**: Nodemailer

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── adminController.js   # Admin dashboard logic
│   ├── authController.js    # Authentication logic
│   ├── bookingController.js # Booking management
│   ├── carController.js     # Car CRUD operations
│   └── userController.js    # User management
├── middleware/
│   └── auth.js              # Authentication middleware
├── models/
│   ├── User.js              # User schema
│   ├── Car.js               # Car schema
│   └── Booking.js           # Booking schema
├── routes/
│   ├── admin.js             # Admin routes
│   ├── auth.js              # Authentication routes
│   ├── bookings.js          # Booking routes
│   ├── cars.js              # Car routes
│   └── users.js             # User routes
├── scripts/
│   └── seed.js              # Database seeding
├── .env.example             # Environment variables template
├── package.json             # Dependencies and scripts
└── server.js                # Main application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository and navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration values.

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the server**
   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000` (or your configured PORT).

## 🔧 Environment Variables

Create a `.env` file in the backend root with the following variables:

```env
# Environment
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/car-calling

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRE=30d

# Frontend
FRONTEND_URL=http://localhost:5173

# Email (Gmail example)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-secret
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key

# File Upload
MAX_FILE_SIZE=5000000
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh access token

### Cars
- `GET /api/cars` - Get all cars (with filtering)
- `GET /api/cars/:id` - Get single car
- `POST /api/cars` - Create car (landlords only)
- `PUT /api/cars/:id` - Update car (owner/admin only)
- `DELETE /api/cars/:id` - Delete car (owner/admin only)

### Bookings
- `GET /api/bookings/my-bookings` - Get user's bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Admin
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/users` - All users
- `GET /api/admin/bookings` - All bookings

## 🗃️ Database Models

### User Model
- Personal information (name, email, phone)
- Authentication (password, tokens)
- Role-based access (user, landlord, admin)
- Account status and verification

### Car Model
- Vehicle specifications (make, model, year, VIN)
- Pricing and availability
- Location and owner information
- Features and condition

### Booking Model
- Booking details (dates, pricing, status)
- Customer and owner references
- Payment and cancellation information

## 🔐 Authentication & Authorization

The API uses JWT tokens for authentication with role-based access control:

- **User**: Basic user operations
- **Landlord**: Car management and booking oversight
- **Admin**: Full system access and management

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📦 Deployment

### Environment Setup
1. Set `NODE_ENV=production` in your environment
2. Configure production database URL
3. Set up proper CORS origins
4. Configure production email service

### Build & Deploy
```bash
# Install dependencies
npm ci --only=production

# Start the server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support or questions, please open an issue in the repository.