import { DataSource, Repository } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import request from 'supertest';
import app from '../../src/app';
import { response } from 'express';
import { Tenant } from '../../src/entity/Tenants';
import { ITenantData } from '../../src/types';
import createJWKSMock, { JWKSMock } from 'mock-jwks';
import { Roles } from '../../src/constants';

describe('POST /tenants/create', () => {
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
            // console.log(Response.body);

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

            // console.log(tenants);
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

            // console.log(tenants);
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

            // console.log(tenants);
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

    describe('Given all fields', () => {
        it('It should return 201 status code', async () => {
            const accessToken = jwks.token({ sub: '1', role: Roles.ADMIN });
            //arrange
            const tenantData = {
                name: 'Tenant name',
                address: 'Tenant address',
            };
            //act
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(tenantData);
            //assert

            expect(response.statusCode).toBe(201);
        });
        it('It should create tenant in database', async () => {
            const accessToken = jwks.token({ sub: '1', role: Roles.ADMIN });
            //arrange
            const tenantData = {
                name: 'Tenant name',
                address: 'Tenant address',
            };
            //act
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(tenantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            //assert

            expect(tenants).toHaveLength(1);
            expect((response.body as Record<string, string>).name).toBe(
                'Tenant name',
            );
        });

        it('should return 401 if user is not authenticated', async () => {
            //arrange
            const tenantData = {
                name: 'Tenant name',
                address: 'Tenant address',
            };
            //act
            const response = await request(app)
                .post('/tenants')
                .send(tenantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            //assert

            expect(tenants).toHaveLength(0);
            expect(response.statusCode).toBe(401);
        });

        it('should return 403 if user is not admin', async () => {
            const accessToken = jwks.token({ sub: '1', role: Roles.MANAGER });
            //arrange
            const tenantData = {
                name: 'Tenant name',
                address: 'Tenant address',
            };
            //act
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(tenantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            //assert

            expect(tenants).toHaveLength(0);
            expect(response.statusCode).toBe(403);
        });
    });

    //sad path
    describe('Fields are missing', () => {
        it('should return 400 if fields are missing', async () => {
            const accessToken = jwks.token({ sub: '1', role: Roles.ADMIN });
            //arrange
            const tenantData = {
                name: 'Tenant name',
                address: '',
            };
            //act
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(tenantData);
            //assert

            expect(response.statusCode).toBe(400);
        });
    });
});

interface TenantData {
    id?: number;
    name: string;
    address: string;
}

describe('PATCH /tenants/:id', () => {
    let connection: DataSource;
    let tenantRepository: Repository<Tenant>;
    let tenant: TenantData;
    let accessToken: string;

    const jwksOrigin = 'http://localhost:5501';
    const jwksPath = '/well-known/jwks.json';
    const jwks: JWKSMock = createJWKSMock(jwksOrigin, jwksPath);

    beforeAll(async () => {
        process.env.JWKS_URL = `${jwksOrigin}${jwksPath}`;
        connection = await AppDataSource.initialize();
        tenantRepository = connection.getRepository(Tenant);
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();

        // Create a test tenant
        tenant = await tenantRepository.save({
            name: 'Old Tenant Name',
            address: 'Old Tenant Address',
        });

        // Generate admin token
        accessToken = jwks.token({ sub: '1', role: Roles.ADMIN });
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    it('should update the tenant details successfully', async () => {
        const updatedTenantData = {
            name: 'Updated Tenant Name',
            address: 'Updated Tenant Address',
        };

        const response = await request(app)
            .patch(`/tenants/${tenant.id}`)
            .set('Cookie', [`accessToken=${accessToken}`])
            .send(updatedTenantData);

        const updatedTenant = await tenantRepository.findOne({
            where: { id: tenant.id },
        });

        expect(response.status).toBe(200);
        expect(updatedTenant).toBeDefined();
        expect(updatedTenant!.name).toBe(updatedTenantData.name);
        expect(updatedTenant!.address).toBe(updatedTenantData.address);
    });

    it('should return a 404 if tenant does not exist', async () => {
        const updatedTenantData = {
            name: 'Non Existent Tenant',
            address: 'Non Existent Address',
        };

        const response = await request(app)
            .patch('/tenants/99999')
            .set('Cookie', [`accessToken=${accessToken}`])
            .send(updatedTenantData);

        expect(response.status).toBe(404);
    });

    it('should return 403 if user is not admin', async () => {
        const nonAdminToken = jwks.token({ sub: '2', role: Roles.MANAGER });
        const updatedTenantData = {
            name: 'Should Not Update',
            address: 'Should Not Update',
        };

        const response = await request(app)
            .patch(`/tenants/${tenant.id}`)
            .set('Cookie', [`accessToken=${nonAdminToken}`])
            .send(updatedTenantData);

        expect(response.status).toBe(403);
    });
});

describe('POST /tenants/update', () => {});

describe('POST /tenants/getAll', () => {});

describe('POST /tenants/getByID', () => {});

describe('POST /tenants/delete', () => {});
