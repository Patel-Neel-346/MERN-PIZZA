import request from 'supertest';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import { DataSource, Repository } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { isJWT, truncateTables } from '../utiles/index';
import { UserData } from '../../src/types';
import { Roles } from '../../src/constants';
import { response } from 'express';
import { RefreshToken } from '../../src/entity/RefreshToken';
import { Alias } from 'typeorm/query-builder/Alias';

describe.skip('POST /auth/register', () => {
    let Connection: DataSource;
    beforeAll(async () => {
        //database connection
        Connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        //database truncate  for testing

        // await truncateTables(Connection);
        await Connection.dropDatabase();
        await Connection.synchronize();
    });

    afterAll(async () => {
        //close the connecvtion
        await Connection.destroy();
    });

    describe('Given All Fields', () => {
        it('should return 201 status code', async () => {
            //AAA formula
            //1 Arrange -- prepare all data for input
            //2 Act --main act for trigger or call
            //3 Assert check what are we check Main Check Except

            //1 step
            const userData = {
                firstName: 'Neel',
                lastName: 'Patel',
                email: 'neel@gmail.com',
                password: 'secret123',
                role: Roles.CUSTOMER,
            };

            //2 step
            const respone = await request(app)
                .post('/auth/register')
                .send(userData);

            //3 step
            expect(respone.statusCode).toBe(201);
        });

        it('should return valid json format', async () => {
            //AAA formula
            //1 Arrange -- prepare all data for input
            //2 Act --main act for trigger or call
            //3 Assert check what are we check Main Check Except

            //1 step
            const userData = {
                firstName: 'Neel',
                lastName: 'Patel',
                email: 'neel@gmail.com',
                password: 'secret123',
            };

            //2 step
            const respone = await request(app)
                .post('/auth/register')
                .send(userData);

            //3 step
            expect(
                (respone.headers as Record<string, string>)['content-type'],
            ).toEqual(expect.stringContaining('json'));
        });

        it('should presist the user to database', async () => {
            //AAA formula
            //1 Arrange -- prepare all data for input
            //2 Act --main act for trigger or call
            //3 Assert check what are we check Main Check Except

            //1 step
            const userData = {
                firstName: 'Jay',
                lastName: 'Patel',
                email: 'neel@gmail.com',
                password: 'secret123',
                role: Roles.CUSTOMER,
            };

            //2 step
            const respone = await request(app)
                .post('/auth/register')
                .send(userData);

            //3 step

            const userRepository = Connection.getRepository(User);
            const user = await userRepository.find();

            expect(user).toHaveLength(1);
            expect(user[0].firstName).toBe(userData.firstName);
            expect(user[0].lastName).toBe(userData.lastName);
            expect(user[0].email).toBe(userData.email);
            // expect(user[0].).toBe(userData.)
        });

        it('should return Id of Created User', async () => {
            //1
            const userData = {
                firstName: 'Karan',
                lastName: 'Rami',
                email: 'Karan@gmail.com',
                password: 'Pass123',
                role: Roles.CUSTOMER,
            };

            //2
            const respone = await request(app)
                .post('/auth/register')
                .send(userData);
            // console.log(respone);

            //3

            const returnedUser = respone.body.user;

            // console.log('ReturndUSER:::', returnedUser);
            const userRepository = Connection.getRepository(User);

            // //generate filter
            // const filter = {
            //     email: userData.email,
            // };
            const user = await userRepository.findOneBy({
                email: userData.email,
            });

            // console.log('userID:', user?.id);
            // console.log('ReturndUserId:', returnedUser.id);

            //3
            expect(user).toBeDefined();
            expect(returnedUser.id).toBe(user?.id);
        });

        it('should add Role to New Users', async () => {
            //1
            const userData = {
                firstName: 'Neel',
                lastName: 'Patel',
                email: 'NeelPatel@gmail.com',
                password: '123456',
                role: Roles.CUSTOMER,
            };

            //2
            const reponse = await request(app)
                .post('/auth/register')
                .send(userData);

            //3
            const userRepository = Connection.getRepository(User);
            const user = await userRepository.find();
            expect(user[0]).toHaveProperty('role');
            expect(user[0].role).toBe(Roles.CUSTOMER);
        });

        it('should store the hased password in database', async () => {
            //1
            const userData = {
                firstName: 'ved',
                lastName: 'veghani',
                email: 'ved@gmail.com',
                password: 'ved123',
                role: Roles.CUSTOMER,
            };

            //2

            const respones = await request(app)
                .post('/auth/register')
                .send(userData);

            //3 assert
            const userRepository = Connection.getRepository(User);
            const user = await userRepository.find();

            expect(user[0].password).not.toBe(userData.password);
            expect(user[0].password).toHaveLength(60);
            expect(user[0].password).toMatch(/^\$2b\$\d+\$/);
        });

        it('should return 400 status code if email is already exists', async () => {
            //1
            const userData = {
                firstName: 'Neel',
                lastName: 'patel',
                email: 'neel@gmail.com',
                password: '12345',
                role: Roles.CUSTOMER,
            };

            const userRepository = Connection.getRepository(User);
            await userRepository.save(userData);

            //2
            const respone = await request(app)
                .post('/auth/register')
                .send(userData);

            const user = await userRepository.find();
            //3

            expect(respone.statusCode).toBe(400);
            expect(user).toHaveLength(1);
        });

        it('should return access token and refresh token in cookies ', async () => {
            //1
            const userData = {
                firstName: 'Neel',
                lastName: 'Patel',
                email: 'neelPatel@gmail.com',
                password: '123456',
                role: Roles.CUSTOMER,
            };
            let accessToken: string | null = null,
                refreshToken: string | null = null;

            //2 act
            const respones = await request(app)
                .post('/auth/register')
                .send(userData);

            //3 assert
            interface Headers {
                ['set-cookie']?: string[];
            }
            // console.log('respones.json:', respones.body);

            const cookies = (respones.header as Headers)['set-cookie'] || [];
            // console.log('Cookies:', cookies);
            // console.log('response.headers:', respones.header);
            cookies.forEach((cooke) => {
                if (cooke.startsWith('accessToken')) {
                    accessToken = cooke.split(';')[0].split('=')[1];
                }
                if (cooke.startsWith('refreshToken')) {
                    refreshToken = cooke.split(';')[0].split('=')[1];
                }
            });
            // console.log('Access Token:', accessToken);
            // console.log('Refresh Token:', refreshToken);

            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();

            expect(isJWT(accessToken)).toBeTruthy();
            expect(isJWT(refreshToken)).toBeTruthy();
        });

        // it('should store the refresh token in database', async () => {
        //     //arrange
        //     const userData = {
        //         firstName: 'Mohit',
        //         lastName: 'Singh',
        //         email: 'mohit@gmail.com',
        //         password: 'secret',
        //     };

        //     //act
        //     const response = await request(app)
        //         .post('/auth/register')
        //         .send(userData);

        //     const refreshTokenRepositroy =
        //         Connection.getRepository(RefreshToken);
        //     // const refreshToken = await refreshTokenRepositroy.find();

        //     const token = await refreshTokenRepositroy
        //         .createQueryBuilder('refreshToken')
        //         .where('refreshToken.userId = :userId', {
        //             userId: (response.body as Record<string, string>).id,
        //         })
        //         .getMany();

        //     console.log('TOKEN:', token);

        //     expect(token).toHaveLength(1);
        // });
        it('should store the rwefresh token in database', async () => {
            //arrange
            const userData = {
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: 'secret',
                role: Roles.CUSTOMER,
            };

            //act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            const refreshTokenRepository =
                Connection.getRepository(RefreshToken);

            // const refresh = await refreshTokenRepository.find();
            // console.log('AllData From refreshtoken:', refresh);
            // const token = await refreshTokenRepository
            //     .createQueryBuilder('refreshToken')
            //     .leftJoin('refreshToken.userId', 'User')
            //     .where('User.id = :userId.id', {
            //         userId: (response.body as Record<string, string>).id,
            //     })
            //     .getMany();

            // assert
            const token = await refreshTokenRepository.find({
                where: {
                    user: {
                        id: response.body.id,
                    },
                },
                relations: ['user'],
            });

            // console.log(token);
            expect(token).toHaveLength(1);
        });
    });
    describe('Missing Fields', () => {
        it('should return 400 if any fileds are missing ', async () => {
            //1
            const userData = {
                firstName: '',
                lastName: '',
                email: 'Neel@gmail.com',
                password: '12345',
                role: Roles.CUSTOMER,
            };

            //2
            const respone = await request(app)
                .post('/auth/register')
                .send(userData);

            //3
            const userRepository = Connection.getRepository(User);
            const user = await userRepository.find();

            expect(respone.statusCode).toBe(400);
            expect(user).toHaveLength(0);
        });

        it('should return 400 status code if firstName is missing', async () => {
            //1
            const userData = {
                firstName: ' ',
                lastName: 'patel',
                email: 'neelpatel6340@gmail.com',
                password: '123',
                role: Roles.CUSTOMER,
            };

            //2

            const respone = await request(app)
                .post('/auth/register')
                .send(userData);

            //3
            const userRepository = Connection.getRepository(User);
            const user = await userRepository.find();

            expect(respone.statusCode).toBe(400);
            // expect(user[0].firstName).not.toBeNull()
        });
        it('should return 400 status code if LastName is missing', async () => {
            //1
            const userData = {
                firstName: 'Neel',
                lastName: ' ',
                email: 'neelpatel6340@gmail.com',
                password: '123',
                role: Roles.CUSTOMER,
            };

            //2

            const respone = await request(app)
                .post('/auth/register')
                .send(userData);

            //3
            const userRepository = Connection.getRepository(User);
            const user = await userRepository.find();

            expect(respone.statusCode).toBe(400);
        });

        it('should return 400 status code if password is missing', async () => {
            //1
            const userData = {
                firstName: 'Neel',
                lastName: 'patel',
                email: 'neelpatel6340@gmail.com',
                password: ' ',
                role: Roles.CUSTOMER,
            };

            //2

            const respone = await request(app)
                .post('/auth/register')
                .send(userData);

            //3
            const userRepository = Connection.getRepository(User);
            const user = await userRepository.find();

            expect(respone.statusCode).toBe(400);
        });

        // it('should return 400 if email is missing '),async;
    });

    describe('fields are not in proper formate', () => {
        it('should return 400 status code if password length is less than 6 chars', async () => {
            //1
            const userData = {
                firstName: 'Neel',
                lastName: 'patel',
                email: 'neelpatel6340@gmail.com',
                password: '12345',
                role: Roles.CUSTOMER,
            };

            //2
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            //3
            const userRepository = Connection.getRepository(User);

            const user = await userRepository.find();

            expect(response.statusCode).toBe(400);
        });

        it('should return 400 status code if email is not valid', async () => {
            //1
            const userData = {
                firstName: 'Neel',
                lastName: 'patel',
                email: 'neelpatel6340@gmail.com',
                password: '12345',
                role: Roles.CUSTOMER,
            };

            //2
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            //3
            const userRepository = Connection.getRepository(User);

            const user = await userRepository.find();

            expect(response.statusCode).toBe(400);
        });
    });
});
