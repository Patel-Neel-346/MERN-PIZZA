import request from 'supertest';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import { DataSource, Repository } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { truncateTables } from '../utiles/index';
import { UserData } from '../../src/types';

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
        it.skip('should return 201 status code', async () => {
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

        it.skip('should return valid json format', async () => {
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

        it.skip('should presist the user to database', async () => {
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

        it('should return Id of Created User', async () => {
            //1
            const userData = {
                firstName: 'Karan',
                lastName: 'Rami',
                email: 'Karan@gmail.com',
                password: 'Pass123',
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
    });
    describe('Missing Fields', () => {});
});
