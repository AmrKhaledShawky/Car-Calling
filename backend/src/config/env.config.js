import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', 'scripts', '.env') });

const DEFAULT_JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';
const DEFAULT_JWT_REFRESH_SECRET = 'your-super-secret-refresh-key-change-this-in-production';
const DEFAULT_MONGODB_URI = 'mongodb://localhost:27017/car-calling';
const DEFAULT_FRONTEND_URL = 'http://localhost:5173';
const DEFAULT_PORT = 5001;

const isProduction = () => process.env.NODE_ENV === 'production';
const normalizeMongoURI = (uri) => {
  if (!uri) {
    return uri;
  }

  if (uri.startsWith('mmongodb://')) {
    return uri.replace('mmongodb://', 'mongodb://');
  }

  if (uri.startsWith('mmongodb+srv://')) {
    return uri.replace('mmongodb+srv://', 'mongodb+srv://');
  }

  return uri;
};
const parsePositiveInteger = (value, fallback) => {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
};
const wasJwtSecretProvided = Boolean(process.env.JWT_SECRET);
const wasJwtRefreshSecretProvided = Boolean(process.env.JWT_REFRESH_SECRET);
const usesDevelopmentJwtSecret = !wasJwtSecretProvided && !isProduction();
const usesDevelopmentJwtRefreshSecret = !wasJwtRefreshSecretProvided && !isProduction();

if (usesDevelopmentJwtSecret) {
  process.env.JWT_SECRET = DEFAULT_JWT_SECRET;
}

if (usesDevelopmentJwtRefreshSecret) {
  process.env.JWT_REFRESH_SECRET = DEFAULT_JWT_REFRESH_SECRET;
}

const config = {
  get nodeEnv() {
    return process.env.NODE_ENV || 'development';
  },

  get isProduction() {
    return isProduction();
  },

  get isVercel() {
    return Boolean(process.env.VERCEL);
  },

  get port() {
    return process.env.PORT || DEFAULT_PORT;
  },

  get frontendUrl() {
    return process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL;
  },

  get serverUrl() {
    return process.env.SERVER_URL || `http://localhost:${this.port}`;
  },

  get bodyLimit() {
    return process.env.BODY_LIMIT || '10mb';
  },

  get logLevel() {
    return process.env.LOG_LEVEL || (this.nodeEnv === 'development' ? 'debug' : 'info');
  },

  rateLimit: {
    get windowMs() {
      return parsePositiveInteger(process.env.RATE_LIMIT_WINDOW, 15) * 60 * 1000;
    },

    get max() {
      return parsePositiveInteger(process.env.RATE_LIMIT_MAX_REQUESTS, 100);
    }
  },

  database: {
    get uri() {
      return normalizeMongoURI(process.env.MONGODB_URI || (isProduction() ? null : DEFAULT_MONGODB_URI));
    }
  },

  jwt: {
    get secret() {
      return process.env.JWT_SECRET;
    },

    get expiresIn() {
      return process.env.JWT_EXPIRE || '7d';
    },

    get refreshSecret() {
      return process.env.JWT_REFRESH_SECRET;
    },

    get refreshExpiresIn() {
      return process.env.JWT_REFRESH_EXPIRE || '30d';
    },

    get hasSecret() {
      return Boolean(process.env.JWT_SECRET);
    },

    get hasRefreshSecret() {
      return Boolean(process.env.JWT_REFRESH_SECRET);
    },

    get wasSecretProvided() {
      return wasJwtSecretProvided;
    },

    get wasRefreshSecretProvided() {
      return wasJwtRefreshSecretProvided;
    },

    get usesDefaultSecret() {
      return usesDevelopmentJwtSecret;
    },

    get usesDefaultRefreshSecret() {
      return usesDevelopmentJwtRefreshSecret;
    }
  }
};

export default config;
