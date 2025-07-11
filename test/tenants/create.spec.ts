import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import request from 'supertest';
import app from '../../src/app';
import { response } from 'express';
import { Tenant } from '../../src/entity/Tenants';
import { ITenantData } from '../../src/types';
import createJWKSMock, { JWKSMock } from 'mock-jwks';
import { Roles } from '../../src/constants';

describe('POST /tenants', () => {
    let connection: DataSource;
    const jwksOrigin = 'http://localhost:5501';
    const jwksPath = '/well-known/jwks.json';
    const jwks: JWKSMock = createJWKSMock(jwksOrigin, jwksPath);

    //connection to DB
    beforeAll(async () => {
        // jwks = createJWKSMock('http://localhost:5001');
        process.env.JWKS_URL = `${jwksOrigin}${jwksPath}`;

        connection = await AppDataSource.initialize();
    });

    //before each api call  clear Prev Database Data from DB
    beforeEach(async () => {
        jwks.start();
        await connection?.dropDatabase();
        await connection?.synchronize();
    });

    afterEach(() => {
        jwks.stop();
    });
    //distory connection after exits Last option
    afterAll(async () => {
        await connection.destroy();
    });

    //happy path
    describe('Given All Fields', () => {
        it('should return 201 status code', async () => {
            //arrange

            const token = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            });

            const tenantData = {
                name: 'Tenant Name',
                address: 'Tenant Address',
            };

            //act

            const Response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${token}`])
                .send(tenantData);

            //assert
            console.log(Response.body);

            // console.log(Response.statusCode);
            expect(Response.statusCode).toBe(201);
        });

        it('should create tenant in database', async () => {
            const token = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            });
            const tenantData = {
                name: 'Tenant Name',
                address: 'Tenant Address',
            };

            //act

            const Response = await request(app)
                .post('/tenants')
                .set('Cookie', `accessToken=${token}`)
                .send(tenantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            console.log(tenants);
            expect(tenants).toHaveLength(1);
            expect((Response.body as Record<string, string>).name).toBe(
                tenantData.name,
            );
        });

        it('should return 401 if user is not authenticated!', async () => {
            // const token = jwks.token({
            //     sub: '2',
            //     role: Roles.ADMIN,
            // });
            const tenantData = {
                name: 'Tenant Name',
                address: 'Tenant Address',
            };

            //act

            const Response = await request(app)
                .post('/tenants')
                // .set('Cookie', `accessToken=${token}`)
                .send(tenantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            console.log(tenants);
            expect(tenants).toHaveLength(0);
            expect(Response.statusCode).toBe(401);
            // expect((Response.body as Record<string, string>).name).toBe(
            //     tenantData.name,
            // );
        });

        it('should return 403 if user is not admin', async () => {
            const token = jwks.token({
                sub: '1',
                role: Roles.MANAGER,
            });
            const tenantData = {
                name: 'Tenant Name',
                address: 'Tenant Address',
            };

            //act

            const Response = await request(app)
                .post('/tenants')
                .set('Cookie', `accessToken=${token}`)
                .send(tenantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            console.log(tenants);
            expect(Response.statusCode).toBe(403);
            expect(tenants).toHaveLength(0);
            // expect((Response.body as Record<string, string>).name).toBe(
            //     tenantData.name,
            // );
        });
    });

    //sad path

    describe('Fields Are missing !', () => {
        it('should return 400 if fields are missing', async () => {});
    });
});
