import request from 'supertest';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { truncateTables } from '../utiles/index';

describe('POST /auth/register', () => {
    let Connection: DataSource;
    beforeAll(async () => {
        //database connection
        Connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        //database truncate  for testing

        await truncateTables(Connection);
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
    });
    describe('Missing Fields', () => {});
});
