import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pino from 'pino';
import pinoHttp from 'pino-http';
import config from '../config/env.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.resolve(__dirname, '..', 'logs');
const isTest = config.nodeEnv === 'test';
const useFileLogs = process.env.ENABLE_FILE_LOGS === 'true' && !isTest;
const noopStream = { write: () => {} };

const loggerOptions = {
  level: config.logLevel,
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      'password',
      '*.password',
      '*.token',
      '*.refreshToken'
    ],
    censor: '[redacted]'
  }
};

const createDestination = (filename) => {
  const destination = pino.destination({
    dest: path.join(logsDir, filename),
    mkdir: true,
    sync: false
  });

  destination.on('error', (error) => {
    process.stderr.write(`Logger file disabled for ${filename}: ${error.message}\n`);
  });

  return destination;
};

const createStreams = () => {
  if (isTest) {
    return [{ level: loggerOptions.level, stream: noopStream }];
  }

  if (!useFileLogs) {
    return [{ level: loggerOptions.level, stream: process.stdout }];
  }

  try {
    fs.mkdirSync(logsDir, { recursive: true });

    const streams = [
      { level: 'info', stream: createDestination('app.log') },
      { level: 'warn', stream: createDestination('warnings.log') },
      { level: 'error', stream: createDestination('errors.log') }
    ];

    streams.push({ level: loggerOptions.level, stream: process.stdout });

    return streams;
  } catch (error) {
    return [{ level: loggerOptions.level, stream: process.stdout }];
  }
};

const createRequestStream = () => {
  if (isTest) {
    return noopStream;
  }

  if (!useFileLogs) {
    return process.stdout;
  }

  try {
    fs.mkdirSync(logsDir, { recursive: true });
    return createDestination('requests.log');
  } catch (error) {
    return process.stdout;
  }
};

const logger = pino(loggerOptions, pino.multistream(createStreams()));

export const requestLogger = pinoHttp({
  logger: pino(loggerOptions, createRequestStream()),
  autoLogging: {
    ignore: (req) => req.url === '/api/health'
  },
  customLogLevel: (req, res, error) => {
    if (error || res.statusCode >= 500) {
      return 'error';
    }

    if (res.statusCode >= 400) {
      return 'warn';
    }

    return 'info';
  },
  customSuccessMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
  customErrorMessage: (req, res, error) => (
    `${req.method} ${req.url} failed with ${res.statusCode}: ${error.message}`
  )
});

export default logger;
