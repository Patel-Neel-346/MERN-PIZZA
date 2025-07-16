import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import { RefreshToken } from '../../src/entity/RefreshToken';
import bcrypt from 'bcrypt';
import { Roles } from '../../src/constants';
import request, { Response } from 'supertest';
import app from '../../src/app';
import { isJWT } from '../utiles';
import createJWKSMock, { JWKSMock } from 'mock-jwks';
import { sign, JwtPayload } from 'jsonwebtoken';
import { serverConfig } from '../../src/config';
describe('AUTH ROUTES', () => {
    let connection: DataSource;
    const jwksOrigin = 'http://localhost:5501';
    const jwksPath = '/well-known/jwks.json';
    let jwks: JWKSMock;

    beforeAll(async () => {
        process.env.JWKS_URL = `${jwksOrigin}${jwksPath}`;
        jwks = createJWKSMock(jwksOrigin, jwksPath);
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

    describe('POST /auth/register', () => {
        it('should return 201 status code', async () => {
            const userData = {
                firstName: 'Neel',
                lastName: 'Patel',
                email: 'neel@gmail.com',
                password: 'secret123',
                role: Roles.CUSTOMER,
            };

            const res = await request(app).post('/auth/register').send(userData);
            expect(res.statusCode).toBe(201);
        });

        it('should return valid JSON format', async () => {
            const userData = {
                firstName: 'Neel',
                lastName: 'Patel',
                email: 'neel@gmail.com',
                password: 'secret123',
                role: Roles.CUSTOMER,
            };

                const response: Response = await request(app)
                    .post('/auth/register')
                    .send(userData);

                expect(response.headers['content-type']).toEqual(
                    expect.stringContaining('json')
                );
            });

            it('should persist the user to database', async () => {
                const userData = {
                    firstName: 'Jay',
                    lastName: 'Patel',
                    email: 'jay@gmail.com',
                    password: 'secret123',
                    role: Roles.CUSTOMER,
                };

            await request(app).post('/auth/register').send(userData);
            const users = await connection.getRepository(User).find();

            expect(users).toHaveLength(1);
            expect(users[0]).toMatchObject({
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
            });
        });

        it('should store hashed password in the database', async () => {
            const userData = {
                firstName: 'Ved',
                lastName: 'Veghani',
                email: 'ved@gmail.com',
                password: 'ved123',
                role: Roles.CUSTOMER,
            };

            await request(app).post('/auth/register').send(userData);
            const user = await connection.getRepository(User).findOneBy({ email: userData.email });

            expect(user?.password).not.toBe(userData.password);
            expect(user?.password).toMatch(/^\$2b\$/);
        });

        it('should return access and refresh tokens in cookies', async () => {
            const userData = {
                firstName: 'Neel',
                lastName: 'Patel',
                email: 'neel@gmail.com',
                password: 'secret123',
                role: Roles.CUSTOMER,
            };

                const response: Response = await request(app)
                    .post('/auth/register')
                    .send(userData);

                let accessToken: string | null = null;
                let refreshToken: string | null = null;

                const cookies = response.headers['set-cookie'] || [];

                if(Array.isArray(cookies)){
                    cookies.forEach((cookie: string) => {
                    if (cookie.startsWith('accessToken')) {
                        accessToken = cookie.split(';')[0].split('=')[1];
                    }
                    if (cookie.startsWith('refreshToken')) {
                        refreshToken = cookie.split(';')[0].split('=')[1];
                    }
                });

                }
                
                expect(accessToken).not.toBeNull();
                expect(refreshToken).not.toBeNull();
                expect(isJWT(accessToken!)).toBeTruthy();
                expect(isJWT(refreshToken!)).toBeTruthy();
            });

        it('should store refresh token in database', async () => {
            const userData = {
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: 'secret',
                role: Roles.CUSTOMER,
            };

                const response: Response = await request(app)
                    .post('/auth/register')
                    .send(userData);

                const refreshTokenRepository = connection.getRepository(RefreshToken);
                const tokens = await refreshTokenRepository.find({
                    where: { user: { id: response.body.user.id } },
                    relations: ['user'],
                });

            expect(refreshTokens).toHaveLength(1);
        });

        it('should return 400 if firstName is missing', async () => {
            const userData = {
                firstName: '',
                lastName: 'Patel',
                email: 'neel@gmail.com',
                password: 'secret123',
                role: Roles.CUSTOMER,
            };

            const res = await request(app).post('/auth/register').send(userData);
            expect(res.statusCode).toBe(400);
        });

        it('should return 400 if email already exists', async () => {
            const userData = {
                firstName: 'Neel',
                lastName: 'Patel',
                email: 'neel@gmail.com',
                password: 'secret123',
                role: Roles.CUSTOMER,
            };

            await connection.getRepository(User).save(userData);
            const res = await request(app).post('/auth/register').send(userData);
            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /auth/login', () => {
        it('should login user and return tokens', async () => {
            const hashedPassword = await bcrypt.hash('secret', 10);
            await connection.getRepository(User).save({
                firstName: 'Ram',
                lastName: 'Lakhan',
                email: 'ram@gmail.com',
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            const res = await request(app).post('/auth/login').send({
                email: 'ram@gmail.com',
                password: 'secret',
            });

                const response: Response = await request(app)
                    .post('/auth/login')
                    .send(loginData);

                let accessToken: string | null = null;
                let refreshToken: string | null = null;

                const cookies = response.headers['set-cookie'] || [];
                if(Array.isArray(cookies)){
                     cookies.forEach((cookie: string) => {
                    if (cookie.startsWith('accessToken')) {
                        accessToken = cookie.split(';')[0].split('=')[1];
                    }
                    if (cookie.startsWith('refreshToken')) {
                        refreshToken = cookie.split(';')[0].split('=')[1];
                    }
                });
                }
               

                expect(response.statusCode).toBe(200);
                expect(accessToken).not.toBeNull();
                expect(refreshToken).not.toBeNull();
                expect(isJWT(accessToken!)).toBeTruthy();
                expect(isJWT(refreshToken!)).toBeTruthy();
            });
        });

        it('should return 400 for wrong password', async () => {
            const hashedPassword = await bcrypt.hash('secret', 10);
            await connection.getRepository(User).save({
                firstName: 'Ram',
                lastName: 'Lakhan',
                email: 'ram@gmail.com',
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            const res = await request(app).post('/auth/login').send({
                email: 'ram@gmail.com',
                password: 'wrongpassword',
            });

            expect(res.statusCode).toBe(400);
        });

        it('should return 404 for non-existent user', async () => {
            const res = await request(app).post('/auth/login').send({
                email: 'notfound@gmail.com',
                password: 'secret',
            });

            expect(res.statusCode).toBe(404);
        });
    });

    describe('GET /auth/self', () => {
        it('should return current user data', async () => {
            const savedUser = await connection.getRepository(User).save({
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: 'secret',
                role: Roles.CUSTOMER,
            });

            const accessToken = jwks.token({
                sub: String(savedUser.id),
                role: savedUser.role,
                email: savedUser.email,
            });

            const res = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`]);

            expect(res.statusCode).toBe(200);
            expect(res.body.email).toBe(savedUser.email);
        });

        it('should return 401 without token', async () => {
            const response: Response = await request(app).get('/auth/self').send();
            expect(response.statusCode).toBe(401);
        });
    });

    describe('POST /auth/refresh', () => {
        it('should refresh tokens', async () => {
            const userRepository = connection.getRepository(User);
            const refreshTokenRepository = connection.getRepository(RefreshToken);

            const userData = {
                firstName: 'Test',
                lastName: 'User',
                email: 'test@gmail.com',
                password: 'secret',
                role: Roles.CUSTOMER,
            });

            const savedUser = await userRepository.save(userData);
            const refreshTokenData = await refreshTokenRepository.save({
                user: savedUser,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
            });

            const refreshToken = jwks.token({
                sub: String(savedUser.id),
                role: savedUser.role,
                email: savedUser.email,
                id: refreshTokenData.id,
            });

            const res = await request(app)
                .post('/auth/refresh')
                .set('Cookie', [`refreshToken=${refreshToken}`]);

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe('True');
        });
    });

    describe('POST /auth/logout', () => {
        it('should logout user and clear tokens', async () => {
            const userRepository = connection.getRepository(User);
            const refreshTokenRepository = connection.getRepository(RefreshToken);

            const userData = {
                firstName: 'Test',
                lastName: 'User',
                email: 'test@gmail.com',
                password: 'secret',
                role: Roles.CUSTOMER,
            });

            const token = await connection.getRepository(RefreshToken).save({
                user,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
            });

            const refreshToken = jwks.token({
                sub: String(savedUser.id),
                role: savedUser.role,
                email: savedUser.email,
                id: refreshTokenData.id,
            });

            const response: Response = await request(app)
                .post('/auth/logout')
                .set('Cookie', [`refreshToken=${refreshToken}`])
                .send();

            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('User has been SuccesFully log out');
        });
    });
});