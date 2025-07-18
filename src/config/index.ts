import { config } from 'dotenv';
import path from 'path';

if (process.env.NODEENV === 'dev') {
  config({ path: path.join(__dirname, '../../.env.dev') });
} else {
  config(); // GitHub Actions or production
}

const {
  PORT,
  NODEENV,
  DB_HOST,
  DB_PORT,
  DB_PASSWORD,
  DB_NAME,
  DB_USERNAME,
  REFRESH_TOKEN_SECRET,
  PRIVATE_KEY_PATH,
  JWKS_URL,
  DATABASE_URL, // <- new
} = process.env;

export const serverConfig = {
  PORT,
  NODEENV,
  DB_HOST,
  DB_PORT,
  DB_PASSWORD,
  DB_NAME,
  DB_USERNAME,
  PRIVATE_KEY_PATH,
  REFRESH_TOKEN_SECRET,
  JWKS_URL,
  DATABASE_URL,
  DB_SSL: NODEENV !== 'dev', // SSL for CI/production
};
