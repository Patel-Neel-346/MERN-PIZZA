import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import { RefreshToken } from '../../src/entity/RefreshToken';
import bcrypt from 'bcryptjs';
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
        describe('Given All Fields', () => {
            it('should return 201 status code', async () => {
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

                expect(response.statusCode).toBe(201);
            });

            it('should return valid json format', async () => {
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
                    expect.stringContaining('json'),
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

                const userRepository = connection.getRepository(User);
                const users = await userRepository.find();

                expect(users).toHaveLength(1);
                expect(users[0].firstName).toBe(userData.firstName);
                expect(users[0].lastName).toBe(userData.lastName);
                expect(users[0].email).toBe(userData.email);
            });

            it('should store hashed password in database', async () => {
                const userData = {
                    firstName: 'Ved',
                    lastName: 'Veghani',
                    email: 'ved@gmail.com',
                    password: 'ved123',
                    role: Roles.CUSTOMER,
                };

                await request(app).post('/auth/register').send(userData);

                const userRepository = connection.getRepository(User);
                const users = await userRepository.find();

                expect(users[0].password).not.toBe(userData.password);
                expect(users[0].password).toHaveLength(60);
                expect(users[0].password).toMatch(/^\$2[a|b]\$\d+\$/);
            });

            it('should return access token and refresh token in cookies', async () => {
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

                if (Array.isArray(cookies)) {
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
                expect(isJWT(accessToken)).toBeTruthy();
                expect(isJWT(refreshToken)).toBeTruthy();
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

                const refreshTokenRepository =
                    connection.getRepository(RefreshToken);
                const tokens = await refreshTokenRepository.find({
                    where: { user: { id: response.body.user.id } },
                    relations: ['user'],
                });

                expect(tokens).toHaveLength(1);
            });
        });

        describe('Missing Fields', () => {
            it('should return 400 if firstName is missing', async () => {
                const userData = {
                    firstName: '',
                    lastName: 'Patel',
                    email: 'neel@gmail.com',
                    password: 'secret123',
                    role: Roles.CUSTOMER,
                };

                const response: Response = await request(app)
                    .post('/auth/register')
                    .send(userData);

                expect(response.statusCode).toBe(400);
            });

            it('should return 400 if email already exists', async () => {
                const userData = {
                    firstName: 'Neel',
                    lastName: 'Patel',
                    email: 'neel@gmail.com',
                    password: 'secret123',
                    role: Roles.CUSTOMER,
                };

                const userRepository = connection.getRepository(User);
                await userRepository.save(userData);

                const response: Response = await request(app)
                    .post('/auth/register')
                    .send(userData);

                expect(response.statusCode).toBe(400);
            });
        });
    });

    describe('POST /auth/login', () => {
        describe('Given Valid Credentials', () => {
            it('should login user and return tokens', async () => {
                const userRepository = connection.getRepository(User);
                const hashedPassword = await bcrypt.hash('secret', 10);

                await userRepository.save({
                    firstName: 'Ram',
                    lastName: 'Lakhan',
                    email: 'ram@gmail.com',
                    password: hashedPassword,
                    role: Roles.CUSTOMER,
                });

                const loginData = {
                    email: 'ram@gmail.com',
                    password: 'secret',
                };

                const response: Response = await request(app)
                    .post('/auth/login')
                    .send(loginData);

                let accessToken: string | null = null;
                let refreshToken: string | null = null;

                const cookies = response.headers['set-cookie'] || [];
                if (Array.isArray(cookies)) {
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
                expect(isJWT(accessToken)).toBeTruthy();
                expect(isJWT(refreshToken)).toBeTruthy();
            });
        });

        describe('Given Invalid Credentials', () => {
            it('should return 400 for wrong password', async () => {
                const userRepository = connection.getRepository(User);
                const hashedPassword = await bcrypt.hash('secret', 10);

                await userRepository.save({
                    firstName: 'Ram',
                    lastName: 'Lakhan',
                    email: 'ram@gmail.com',
                    password: hashedPassword,
                    role: Roles.CUSTOMER,
                });

                const loginData = {
                    email: 'ram@gmail.com',
                    password: 'wrongpassword',
                };

                const response: Response = await request(app)
                    .post('/auth/login')
                    .send(loginData);

                expect(response.statusCode).toBe(400);
            });

            it('should return 404 for non-existent user', async () => {
                const loginData = {
                    email: 'nonexistent@gmail.com',
                    password: 'secret',
                };

                const response: Response = await request(app)
                    .post('/auth/login')
                    .send(loginData);

                expect(response.statusCode).toBe(404);
            });
        });
    });

    describe('GET /auth/self', () => {
        it('should return current user data', async () => {
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

            const response: Response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send();

            expect(response.statusCode).toBe(200);
            expect(response.body.id).toBe(savedUser.id);
            expect(response.body.email).toBe(savedUser.email);
        });

        it('should return 401 without token', async () => {
            const response: Response = await request(app)
                .get('/auth/self')
                .send();
            expect(response.statusCode).toBe(401);
        });
    });

    describe('POST /auth/refresh', () => {
        it('should refresh tokens', async () => {
            const userRepository = connection.getRepository(User);
            const refreshTokenRepository =
                connection.getRepository(RefreshToken);

            const userData = {
                firstName: 'Test',
                lastName: 'User',
                email: 'test@gmail.com',
                password: 'secret',
                role: Roles.CUSTOMER,
            };

            const savedUser = await userRepository.save(userData);
            const refreshTokenData = await refreshTokenRepository.save({
                user: savedUser,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
                relations: ['users'],
            });

            const payload: JwtPayload = {
                sub: String(savedUser.id),
                role: savedUser.role,
                firstname: savedUser.firstName,
                lastName: savedUser.lastName,
                email: savedUser.email,
                id: refreshTokenData.id,
            };
            const refreshToken = sign(
                payload,

                `${serverConfig.REFRESH_TOKEN_SECRET!}`,
                {
                    algorithm: 'HS256',
                    expiresIn: '1y',
                    issuer: 'auth-server',
                    jwtid: String(payload.id),
                },
            );

            const response: Response = await request(app)
                .post('/auth/refresh')
                .set('Cookie', [`refreshToken=${refreshToken}`])
                .send();

            console.log(response.body as Record<string, string>);

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe('True');
        });
    });

    describe('POST /auth/logout', () => {
        it('should logout user and clear tokens', async () => {
            const userRepository = connection.getRepository(User);
            const refreshTokenRepository =
                connection.getRepository(RefreshToken);

            const userData = {
                firstName: 'Test',
                lastName: 'User',
                email: 'test@gmail.com',
                password: 'secret',
                role: Roles.CUSTOMER,
            };

            const savedUser = await userRepository.save(userData);
            const refreshTokenData = await refreshTokenRepository.save({
                user: savedUser,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
            });

            const payload: JwtPayload = {
                sub: String(savedUser.id),
                role: savedUser.role,
                firstname: savedUser.firstName,
                lastName: savedUser.lastName,
                email: savedUser.email,
                id: refreshTokenData.id,
            };
            const refreshToken = sign(
                payload,
                `${serverConfig.REFRESH_TOKEN_SECRET!}`,
                {
                    algorithm: 'HS256',
                    expiresIn: '1y',
                    issuer: 'auth-server',
                    jwtid: String(payload.id),
                },
            );

            console.log('RefreshTokenChecking::', refreshToken);

            const response: Response = await request(app)
                .get('/auth/logout')
                .set('Cookie', [`refreshToken=${refreshToken}`])
                .send();

            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe(
                'User has been SuccesFully log out',
            );
        });
    });
});
