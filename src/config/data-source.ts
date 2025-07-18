import { DataSource } from 'typeorm';
import { serverConfig } from './index';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: serverConfig.DB_HOST,
  port: Number(serverConfig.DB_PORT),
  username: serverConfig.DB_USERNAME,
  password: serverConfig.DB_PASSWORD,
  database: serverConfig.DB_NAME,
  synchronize: false,
  ssl: serverConfig.DB_SSL ? { rejectUnauthorized: false } : undefined,
  entities: ['src/entity/**/*.ts'],
  migrations: ['src/migration/**/*.ts'],
});
