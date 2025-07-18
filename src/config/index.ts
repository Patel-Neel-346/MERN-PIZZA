import { config } from 'dotenv';
import path from 'path';

// Load .env.dev in dev mode, otherwise use system env (like GitHub Actions)
if (process.env.NODEENV === 'dev') {
  config({ path: path.join(__dirname, '../../.env.dev') });
} else {
  config(); // Use system env (GitHub secrets in Actions)
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
  PRIVATE_KEY,
  JWKS_URL,
} = process.env;

export const serverConfig = {
  PORT,
  NODEENV,
  DB_HOST,
  DB_PORT,
  DB_PASSWORD,
  DB_NAME,
  DB_USERNAME,
  PRIVATE_KEY,
  REFRESH_TOKEN_SECRET,
  JWKS_URL,
  DB_SSL: NODEENV !== 'dev', // use SSL in CI/production
};
