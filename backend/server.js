import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import config from './src/config/env.config.js';
import connectDB from './src/config/database.js';

import errorMiddleware from './src/middleware/error.middleware.js';

import ApiError from './src/utils/ApiError.js';
import ApiResponse from './src/utils/ApiResponse.js';
import asyncHandler from './src/utils/asyncHandler.js';
import logger, { requestLogger } from './src/utils/logger.js';

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'UNCAUGHT EXCEPTION! Shutting down...');
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'UNHANDLED REJECTION! Shutting down...');
  process.exit(1);
});

import authRoutes from './src/routes/auth.js';
import carRoutes from './src/routes/cars.js';
import userRoutes from './src/routes/users.js';
import bookingRoutes from './src/routes/bookings.js';
import adminRoutes from './src/routes/admin.js';
import ownerRoutes from './src/routes/owner.js';
import privateRoutes from './src/routes/private.js';
import publicRoutes from './src/routes/public.js';

logger.info({ loaded: config.jwt.wasSecretProvided }, 'JWT_SECRET loaded');

const isVercel = config.isVercel;

// Development fallbacks for missing JWT secrets
if (config.jwt.usesDefaultSecret) {
  logger.warn('Using development fallback JWT_SECRET');
}

if (config.jwt.usesDefaultRefreshSecret) {
  logger.warn('Using development fallback JWT_REFRESH_SECRET');
}

if (!config.jwt.secret || !config.jwt.refreshSecret) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set');
}

const app = express();
app.use(requestLogger);
const PORT = config.port;

// Add server info to app.locals for URL generation
app.locals.serverUrl = process.env.SERVER_URL || `http://localhost:${PORT}`;

app.set('trust proxy', 1);


// Security middleware
app.use(helmet());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api', apiLimiter);

// CORS configuration
const corsOptions = {
  origin: config.frontendUrl,
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: config.bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: config.bodyLimit }));

// Compression middleware
app.use(compression());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

const ensureDatabase = asyncHandler(async (req, res, next) => {
  await connectDB();
  return next();
});

app.use('/api', ensureDatabase);

// Health check endpoint
app.get('/api/health', (req, res) => {
  return ApiResponse.success(res, null, 'Car Calling API is running', 200, {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', (req, res, next) => {
  const legacyAuthPaths = new Set([
    '/login',
    '/register',
    '/logout',
    '/me',
    '/refresh-token',
    '/forgot-password',
    '/reset-password'
  ]);

  if (legacyAuthPaths.has(req.path) || req.path.startsWith('/verify-email/')) {
    return authRoutes(req, res, next);
  }

  next();
});
app.use('/api/cars', carRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/private', privateRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use('*', (req, res, next) => {
  next(new ApiError(404, 'Route not found'));
});

app.use(errorMiddleware);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      logger.info({
        port: PORT,
        frontendUrl: config.frontendUrl,
        environment: config.nodeEnv
      }, 'Car Calling API server started');
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
};

if (!isVercel && process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
