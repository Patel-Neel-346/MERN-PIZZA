import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entity/User';
import { serverConfig } from '.';
import { RefreshToken } from '../entity/RefreshToken';
import { Tenant } from '../entity/Tenants';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: serverConfig.DB_HOST,
    port: Number(serverConfig.DB_PORT),
    username: serverConfig.DB_USERNAME,
    password: serverConfig.DB_PASSWORD,
    database: serverConfig.DB_NAME,

    //IMPOTANT NOTICE !!!!!!!!!!!!!!!!!!!!!!!!!!
    //Dont use this in Production use or do false only do in test and test for true
    synchronize: false, //only true in development && test development false in Production :xD
    logging: false,
    entities: ['src/entity/*.{ts,js}'], //tables ,documents
    migrations: ['src/migration/*.{ts,js}'],
    subscribers: [],
});
