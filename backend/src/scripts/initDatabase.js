import mongoose from 'mongoose';

import config from '../config/env.config.js';
import connectDB from '../config/database.js';
import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import User from '../models/User.js';

const models = [User, Car, Booking];

const ensureCollection = async (model) => {
  const collectionName = model.collection.name;
  const exists = await mongoose.connection.db
    .listCollections({ name: collectionName }, { nameOnly: true })
    .hasNext();

  if (exists) {
    return 'exists';
  }

  await model.createCollection();
  return 'created';
};

const ensureModelSchema = async (model) => {
  const status = await ensureCollection(model);
  await model.createIndexes();
  const indexes = await model.collection.indexes();

  return {
    modelName: model.modelName,
    collectionName: model.collection.name,
    status,
    indexes: indexes.map((index) => index.name)
  };
};

const printConnectionTarget = (connection) => {
  console.log(`Connected to MongoDB host: ${connection.connection.host}`);
  console.log(`Database: ${connection.connection.name}`);
};

const initDatabase = async () => {
  try {
    if (!process.env.MONGODB_URI && !config.isProduction) {
      console.warn(`MONGODB_URI is not set; using development default ${config.database.uri}`);
    }

    const connection = await connectDB({ serverSelectionTimeoutMS: 10000 });
    printConnectionTarget(connection);

    for (const model of models) {
      const result = await ensureModelSchema(model);
      console.log(
        `${result.modelName} -> ${result.collectionName}: ${result.status}; indexes: ${result.indexes.join(', ')}`
      );
    }

    console.log('Database schema initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize database schema.');
    console.error(error.message);

    if (
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ENOTFOUND') ||
      error.message.includes('querySrv')
    ) {
      console.error('Check that MONGODB_URI points to the new database and that MongoDB is reachable.');
    }

    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
};

await initDatabase();
