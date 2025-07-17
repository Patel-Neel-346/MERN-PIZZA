import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import bcrypt from 'bcryptjs';
import { Roles } from '../../src/constants';
import request from 'supertest';
import app from '../../src/app';
import { isJWT } from '../utiles';

describe('POST /auth/login', () => {
    let Connection: DataSource;

    beforeAll(async () => {
        Connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await Connection?.dropDatabase();
        await Connection?.synchronize();
    });

    afterAll(async () => {
        await Connection.destroy();
    });

    //happy path
    describe('Given All Fields ', () => {
        it('should login the user and have access token ,refresh token to if credentail are correct', async () => {
            const userRepository = Connection.getRepository(User);

            const hashedPassword = await bcrypt.hash('secret', 10);

            await userRepository.save({
                firstName: 'Ram',
                lastName: 'lakhan',
                email: 'Ram@gmail.com',
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            const userData = {
                email: 'Ram@gmail.com',
                password: 'secret',
            };

            //2 act

            const respone = await request(app)
                .post('/auth/login')
                .send(userData);

            let accessToken: string | null = null;
            let refreshToken: string | null = null;
            //3

            interface Headers {
                ['set-cookie']?: string[];
            }

            const cookie = (respone.header as Headers)['set-cookie'] || [];

            cookie.forEach((cookie) => {
                if (cookie.startsWith('accessToken')) {
                    accessToken = cookie.split(';')[0].split('=')[1];
                }

                if (cookie.startsWith('refreshToken')) {
                    refreshToken = cookie.split(';')[0].split('=')[1];
                }
            });

            //3 assert

            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();

            expect(isJWT(accessToken)).toBeTruthy();
            expect(isJWT(refreshToken)).toBeTruthy();

            expect(respone.statusCode).toBe(200);
        });
    });
    //sad path

    describe('Fields Are Missing ', () => {
        it('should return 400 if credentials are not correct', async () => {
            const userRepository = Connection.getRepository(User);

            // Create and save user in the database
            const hashedPassword = await bcrypt.hash('secret', 10);
            await userRepository.save({
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            // Mock login data
            const userData = {
                email: 'mohit@gmail.com',
                password: 'secreta',
            };

            // Act
            const response = await request(app)
                .post('/auth/login')
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(400); // Adjust if the API uses a different status code for success
        });
    });
});
