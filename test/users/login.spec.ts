import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import bcrypt from 'bcrypt';
import { Roles } from '../../src/constants';
import request from 'supertest';
import app from '../../src/app';
import { isJWT } from '../utiles';

describe('POST /auth/login', () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe('Given valid credentials', () => {
        it('should login user and return access & refresh tokens', async () => {
            const userRepository = connection.getRepository(User);

            const hashedPassword = await bcrypt.hash('secret', 10);
            await userRepository.save({
                firstName: 'Ram',
                lastName: 'Lakhan',
                email: 'ram@gmail.com',
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'ram@gmail.com',
                    password: 'secret',
                });

            const rawCookies = res.header['set-cookie'];
            const cookies: string[] = Array.isArray(rawCookies) ? rawCookies : [rawCookies];

            const accessToken = cookies
                .find(c => c.startsWith('accessToken='))?.split('=')[1]?.split(';')[0];

            const refreshToken = cookies
                .find(c => c.startsWith('refreshToken='))?.split('=')[1]?.split(';')[0];

            expect(res.statusCode).toBe(200);
            expect(accessToken).toBeDefined();
            expect(refreshToken).toBeDefined();
            expect(isJWT(accessToken!)).toBeTruthy();
            expect(isJWT(refreshToken!)).toBeTruthy();
        });
    });

    describe('Given invalid credentials', () => {
        it('should return 400 if password is incorrect', async () => {
            const userRepository = connection.getRepository(User);

            const hashedPassword = await bcrypt.hash('secret', 10);
            await userRepository.save({
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'mohit@gmail.com',
                    password: 'wrongpass',
                });

            expect(res.statusCode).toBe(400);
        });
    });
});
