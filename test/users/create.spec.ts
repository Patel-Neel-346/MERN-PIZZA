import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import request from 'supertest';
import createJWKSMock from 'mock-jwks';
import { Roles } from '../../src/constants';
import { User } from '../../src/entity/User';
import { createTenant } from '../utiles';
import { Tenant } from '../../src/entity/Tenants';

describe('POST /users', () => {
    let connection: DataSource;
    const jwksOrigin = 'http://localhost:5501';
    const jwksPath = '/well-known/jwks.json';
    const jwks: JWKSMock = createJWKSMock(jwksOrigin, jwksPath);

    beforeAll(async () => {
        process.env.JWKS_URL = `${jwksOrigin}${jwksPath}`;
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe('Given all fields', () => {
        it('should create user in database', async () => {
            const tenant = await createTenant(connection.getRepository(Tenant));
            const accessToken = jwks.token({ sub: '1', role: Roles.ADMIN });
            const userRepository = connection.getRepository(User);

            const userData = {
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: 'password',
                tenantId: tenant.id,
                role: Roles.MANAGER,
            };

            await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(userData);

            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].email).toBe(userData.email);
        });

        it('should create user with manager role in database', async () => {
            const tenant = await createTenant(connection.getRepository(Tenant));
            const accessToken = jwks.token({ sub: '1', role: Roles.ADMIN });

            const userData = {
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: 'password',
                tenantId: tenant.id,
                role: Roles.MANAGER,
            };

            const userRepository = connection.getRepository(User);
            await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(userData);

            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].role).toBe(Roles.MANAGER);
        });
    });
});
