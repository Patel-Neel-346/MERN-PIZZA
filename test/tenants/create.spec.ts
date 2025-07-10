import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import request from 'supertest';
import app from '../../src/app';
import { response } from 'express';
import { Tenant } from '../../src/entity/Tenants';
import { ITenantData } from '../../src/types';

describe('POST /tenants', () => {
    let connection: DataSource;

    //connection to DB
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    //before each api call  clear Prev Database Data from DB
    beforeEach(async () => {
        await connection?.dropDatabase();
        await connection?.synchronize();
    });

    //distory connection after exits Last option
    afterAll(async () => {
        await connection.destroy();
    });

    //happy path
    describe('Given All Fields', () => {
        it('should return 201 status code', async () => {
            //arrange

            const tenantData = {
                name: 'Tenant Name',
                address: 'Tenant Address',
            };

            //act

            const Response = await request(app)
                .post('/tenants')
                .send(tenantData);

            //assert

            // console.log(Response.statusCode);
            expect(Response.statusCode).toBe(201);
        });

        it('should create tenant in database', async () => {
            const tenantData = {
                name: 'Tenant Name',
                address: 'Tenant Address',
            };

            //act

            const Response = await request(app)
                .post('/tenants')
                .send(tenantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            expect(tenants).toHaveLength(1);
            expect((Response.body as Record<string, string>).name).toBe(
                tenantData.name,
            );
        });

        it('should return 401 if user is not authenticated!', async () => {});

        it('should return 403 if user is not admin', async () => {});
    });

    //sad path

    describe('Fields Are missing !', () => {
        it('should return 400 if fields are missing', async () => {});
    });
});
