import { DataSource } from 'typeorm';
import { serverConfig } from './index';
import path from 'path';

console.log('[DB] Using config:', {
  env: serverConfig.NODEENV,
  usingUrl: !!serverConfig.DATABASE_URL,
});

export const AppDataSource = new DataSource(
  serverConfig.DATABASE_URL
    ? {
        type: 'postgres',
        url: serverConfig.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        synchronize: false,
        logging: false,
        entities: [path.join(__dirname, '../entity/**/*.{ts,js}')],
        migrations: [path.join(__dirname, '../migration/**/*.{ts,js}')],
      }
    : {
        type: 'postgres',
        host: serverConfig.DB_HOST,
        port: Number(serverConfig.DB_PORT),
        username: serverConfig.DB_USERNAME,
        password: serverConfig.DB_PASSWORD,
        database: serverConfig.DB_NAME,
        ssl: serverConfig.DB_SSL ? { rejectUnauthorized: false } : false,
        synchronize: false,
        logging: false,
        entities: [path.join(__dirname, '../entity/**/*.{ts,js}')],
        migrations: [path.join(__dirname, '../migration/**/*.{ts,js}')],
      }
);
