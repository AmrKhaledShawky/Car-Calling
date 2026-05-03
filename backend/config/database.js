import mongoose from 'mongoose';

let connectionPromise = null;
let listenersRegistered = false;

const getMongoURI = () => {
  const mongoURI = process.env.MONGODB_URI || (process.env.NODE_ENV === 'production'
    ? null
    : 'mongodb://localhost:27017/car-calling');

  if (!mongoURI) {
    throw new Error('MONGODB_URI must be set');
  }

  return mongoURI;
};

const registerConnectionHandlers = () => {
  if (listenersRegistered) {
    return;
  }

  listenersRegistered = true;

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    connectionPromise = null;
    console.log('MongoDB disconnected');
  });

  if (!process.env.VERCEL) {
    process.once('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
  }
};

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(getMongoURI(), {
      // Modern Mongoose doesn't need these options, but keeping for compatibility
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    }).then((conn) => {
      registerConnectionHandlers();
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    }).catch((error) => {
      connectionPromise = null;
      console.error('Error connecting to MongoDB:', error.message);
      throw error;
    });
  }

  return connectionPromise;
};

export default connectDB;
