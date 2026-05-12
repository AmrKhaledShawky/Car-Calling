import mongoose from 'mongoose';
import dotenv from 'dotenv';

process.env.NODE_ENV = 'test';
dotenv.config();

const DEFAULT_TEST_MONGODB_URI = 'mongodb://localhost:27017/car_calling_test';

const buildTestMongoURI = (uri) => {
  if (!uri) {
    return DEFAULT_TEST_MONGODB_URI;
  }

  const [base, query = ''] = uri.split('?');
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const schemeEnd = normalizedBase.indexOf('://');
  const pathStart = schemeEnd === -1 ? -1 : normalizedBase.indexOf('/', schemeEnd + 3);
  const testBase = pathStart === -1
    ? `${normalizedBase}/car_calling_test`
    : `${normalizedBase.slice(0, pathStart)}/car_calling_test`;

  return query ? `${testBase}?${query}` : testBase;
};

let MONGO_URI = process.env.MONGO_URI_TEST;

if (!MONGO_URI) {
  MONGO_URI = buildTestMongoURI(process.env.MONGODB_URI);
}

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});
