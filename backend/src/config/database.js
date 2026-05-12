import mongoose from 'mongoose';
import config from './env.config.js';
import logger from '../utils/logger.js';

let connectionPromise = null;
let listenersRegistered = false;

const getMongoURI = () => {
  const mongoURI = config.database.uri;

  if (!mongoURI) {
    throw new Error('MONGODB_URI must be set');
  }

  const maskedURI = mongoURI.replace(/:([^@]+)@/, ':****@');
  logger.info(`Connecting to MongoDB: ${maskedURI}`);

  return mongoURI;
};

const registerConnectionHandlers = () => {
  if (listenersRegistered) {
    return;
  }

  listenersRegistered = true;

  mongoose.connection.on('error', (err) => {
    logger.error({ err }, 'MongoDB connection error');
  });

  mongoose.connection.on('disconnected', () => {
    connectionPromise = null;
    logger.warn('MongoDB disconnected');
  });

  if (!config.isVercel) {
    process.once('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });
  }
};

const connectDB = async (options = {}) => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(getMongoURI(), {
      // Modern Mongoose doesn't need these options, but keeping for compatibility
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      ...options
    }).then((conn) => {
      registerConnectionHandlers();
      logger.info({ host: conn.connection.host }, 'MongoDB connected');
      return conn;
    }).catch((error) => {
      connectionPromise = null;
      logger.error({ err: error }, 'Error connecting to MongoDB');
      throw error;
    });
  }

  return connectionPromise;
};

export default connectDB;
