import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';
import request from 'supertest';
import app from '../../src/app';
import createJWKSMock from 'mock-jwks';

describe('POST /users/login', () => {
    let connection: DataSource;
    const jwksOrigin = 'http://localhost:5501';
    const jwksPath = '/well-known/jwks.json';
    const jwks = createJWKSMock(jwksOrigin, jwksPath);

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

    describe('Given All Fields', () => {
        it('should return User data', async () => {
            const userData = {
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: 'secret',
                role: Roles.CUSTOMER,
            };

            const userRepository = connection.getRepository(User);
            const savedUser = await userRepository.save(userData);

            const accessToken = jwks.token({
                sub: String(savedUser.id),
                role: savedUser.role,
                email: savedUser.email,
            });

            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send();

            expect(response.statusCode).toBe(200);
            expect(response.body.id).toBe(savedUser.id);
        });
    });

    describe('Fields Are Missing', () => {});

    describe('GET auth/self', () => {
        it('Should return the 200 status code', async () => {
            const accessToken = jwks.token({ sub: '1', role: 'any' });

            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send();
            expect(response.statusCode).toBe(200);
        });

        it('Should return the user data', async () => {
            const userRepository = connection.getRepository(User);

            const user = await userRepository.save({
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: 'password',
                role: Roles.CUSTOMER,
            });

            const accessToken = jwks.token({
                sub: String(user.id),
                role: user.role,
            });

            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send();
            expect((response.body as Record<string, string>).id).toBe(user.id);
        });

        it('Should not return the password field', async () => {
            const userRepository = connection.getRepository(User);

            const user = await userRepository.save({
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: 'password',
                role: Roles.CUSTOMER,
            });

            const accessToken = jwks.token({
                sub: String(user.id),
                role: user.role,
            });

            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send();
            expect(
                (response.body as Record<string, string>).id,
            ).not.toHaveProperty('password');
        });

        it('Should return 401 if no token is sent', async () => {
            const userRepository = connection.getRepository(User);

            await userRepository.save({
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: 'password',
                role: Roles.CUSTOMER,
            });

            const response = await request(app).get('/auth/self').send();
            expect(response.statusCode).toBe(401);
        });
    });
});

