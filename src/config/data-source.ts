import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { serverConfig } from '.';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: serverConfig.DB_HOST,
    port: Number(serverConfig.DB_PORT),
    username: serverConfig.DB_USERNAME,
    password: serverConfig.DB_PASSWORD,
    database: serverConfig.DB_NAME,
    synchronize: false,
    logging: false,
    entities: ['src/entity/*.{ts,js}'],
    migrations: ['src/migration/*.{ts,js}'],
    subscribers: [],
    ssl:{
        rejectUnauthorized:false
    }
});
