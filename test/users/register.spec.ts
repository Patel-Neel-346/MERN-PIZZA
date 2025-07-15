import request from 'supertest';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { isJWT } from '../utiles/index';
import { Roles } from '../../src/constants';
import { RefreshToken } from '../../src/entity/RefreshToken';

describe('POST /auth/register', () => {
    let Connection: DataSource;
    
    beforeAll(async () => {
        Connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await Connection.dropDatabase();
        await Connection.synchronize();
    });

    afterAll(async () => {
        await Connection.destroy();
    });

    describe('Given All Fields', () => {
        it('should return 201 status code', async () => {
            const userData = {
                firstName: 'Neel',
                lastName: 'Patel',
                email: 'neel@gmail.com',
                password: 'secret123',
                role: Roles.CUSTOMER,
            };

            const respone = await request(app)
                .post('/auth/register')
                .send(userData);

            expect(respone.statusCode).toBe(201);
        });

        it('should return valid json format', async () => {
            const userData = {
                firstName: 'Neel',
                lastName: 'Patel',
                email: 'neel@gmail.com',
                password: 'secret123',
            };

            const respone = await request(app)
                .post('/auth/register')
                .send(userData);

            expect(
                (respone.headers as Record<string, string>)['content-type'],
            ).toEqual(expect.stringContaining('json'));
        });

        it('should presist the user to database', async () => {
            const userData = {
                firstName: 'Jay',
                lastName: 'Patel',
                email: 'neel@gmail.com',
                password: 'secret123',
                role: Roles.CUSTOMER,
            };

            const respone = await request(app)
                .post('/auth/register')
                .send(userData);

            const userRepository = Connection.getRepository(User);
            const user = await userRepository.find();

            expect(user).toHaveLength(1);
            expect(user[0].firstName).toBe(userData.firstName);
            expect(user[0].lastName).toBe(userData.lastName);
            expect(user[0].email).toBe(userData.email);
        });

        it('should return Id of Created User', async () => {
            const userData = {
                firstName: 'Karan',
                lastName: 'Rami',
                email: 'Karan@gmail.com',
                password: 'Pass123',
                role: Roles.CUSTOMER,
            };

            const respone = await request(app)
                .post('/auth/register')
                .send(userData);

            const returnedUser = respone.body.user;
            const userRepository = Connection.getRepository(User);
            const user = await userRepository.findOneBy({
                email: userData.email,
            });

            expect(user).toBeDefined();
            expect(returnedUser.id).toBe(user?.id);
        });

        it('should add Role to New Users', async () => {
            const userData = {
                firstName: 'Neel',
                lastName: 'Patel',
                email: 'NeelPatel@gmail.com',
                password: '123456',
                role: Roles.CUSTOMER,
            };

            const reponse = await request(app)
                .post('/auth/register')
                .send(userData);

            const userRepository = Connection.getRepository(User);
            const user = await userRepository.find();
            expect(user[0]).toHaveProperty('role');
            expect(user[0].role).toBe(Roles.CUSTOMER);
        });

        it('should store the hased password in database', async () => {
            const userData = {
                firstName: 'ved',
                lastName: 'veghani',
                email: 'ved@gmail.com',
                password: 'ved123',
                role: Roles.CUSTOMER,
            };

            const respones = await request(app)
                .post('/auth/register')
                .send(userData);

            const userRepository = Connection.getRepository(User);
            const user = await userRepository.find();

            expect(user[0].password).not.toBe(userData.password);
            expect(user[0].password).toHaveLength(60);
            expect(user[0].password).toMatch(/^\$2b\$\d+\$/);
        });

        it('should return 400 status code if email is already exists', async () => {
            const userData = {
                firstName: 'Neel',
                lastName: 'patel',
                email: 'neel@gmail.com',
                password: '12345',
                role: Roles.CUSTOMER,
            };

            const userRepository = Connection.getRepository(User);
            await userRepository.save(userData);

            const respone = await request(app)
                .post('/auth/register')
                .send(userData);

            const user = await userRepository.find();

            expect(respone.statusCode).toBe(400);
            expect(user).toHaveLength(1);
        });

        it('should return access token and refresh token in cookies ', async () => {
            const userData = {
                firstName: 'Neel',
                lastName: 'Patel',
                email: 'neelPatel@gmail.com',
                password: '123456',
                role: Roles.CUSTOMER,
            };
            let accessToken: string | null = null,
                refreshToken: string | null = null;

            const respones = await request(app)
                .post('/auth/register')
                .send(userData);

            interface Headers {
                ['set-cookie']?: string[];
            }

            const cookies = (respones.header as Headers)['set-cookie'] || [];
            cookies.forEach((cooke) => {
                if (cooke.startsWith('accessToken')) {
                    accessToken = cooke.split(';')[0].split('=')[1];
                }
                if (cooke.startsWith('refreshToken')) {
                    refreshToken = cooke.split(';')[0].split('=')[1];
                }
            });

            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();
            expect(isJWT(accessToken)).toBeTruthy();
            expect(isJWT(refreshToken)).toBeTruthy();
        });

        it('should store the refresh token in database', async () => {
            const userData = {
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: 'secret',
                role: Roles.CUSTOMER,
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            const refreshTokenRepository = Connection.getRepository(RefreshToken);
            const token = await refreshTokenRepository.find({
                where: {
                    user: {
                        id: response.body.id,
                    },
                },
                relations: ['user'],
            });

            expect(token).toHaveLength(1);
        });
    });

    describe('Missing Fields', () => {
        it('should return 400 if any fileds are missing ', async () => {
            const userData = {
                firstName: '',
                lastName: '',
                email: 'Neel@gmail.com',
                password: '12345',
                role: Roles.CUSTOMER,
            };

            const respone = await request(app)
                .post('/auth/register')
                .send(userData);

            const userRepository = Connection.getRepository(User);
            const user = await userRepository.find();

            expect(respone.statusCode).toBe(400);
            expect(user).toHaveLength(0);
        });

        it('should return 400 status code if firstName is missing', async () => {
            const userData = {
                firstName: ' ',
                lastName: 'patel',
                email: 'neelpatel6340@gmail.com',
                password: '123',
                role: Roles.CUSTOMER,
            };

            const respone = await request(app)
                .post('/auth/register')
                .send(userData);

            const userRepository = Connection.getRepository(User);
            const user = await userRepository.find();

            expect(respone.statusCode).toBe(400);
        });

        it('should return 400 status code if LastName is missing', async () => {
            const userData = {
                firstName: 'Neel',
                lastName: ' ',
                email: 'neelpatel6340@gmail.com',
                password: '123',
                role: Roles.CUSTOMER,
            };

            const respone = await request(app)
                .post('/auth/register')
                .send(userData);

            const userRepository = Connection.getRepository(User);
            const user = await userRepository.find();

            expect(respone.statusCode).toBe(400);
        });

        it('should return 400 status code if password is missing', async () => {
            const userData = {
                firstName: 'Neel',
                lastName: 'patel',
                email: 'neelpatel6340@gmail.com',
                password: ' ',
                role: Roles.CUSTOMER,
            };

            const respone = await request(app)
                .post('/auth/register')
                .send(userData);

            const userRepository = Connection.getRepository(User);
            const user = await userRepository.find();

            expect(respone.statusCode).toBe(400);
        });
    });

    describe('fields are not in proper formate', () => {
        it('should return 400 status code if password length is less than 6 chars', async () => {
            const userData = {
                firstName: 'Neel',
                lastName: 'patel',
                email: 'neelpatel6340@gmail.com',
                password: '12345',
                role: Roles.CUSTOMER,
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            const userRepository = Connection.getRepository(User);
            const user = await userRepository.find();

            expect(response.statusCode).toBe(400);
        });

        it('should return 400 status code if email is not valid', async () => {
            const userData = {
                firstName: 'Neel',
                lastName: 'patel',
                email: 'neelpatel6340@gmail.com',
                password: '12345',
                role: Roles.CUSTOMER,
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            const userRepository = Connection.getRepository(User);
            const user = await userRepository.find();

            expect(response.statusCode).toBe(400);
        });
    });
});

