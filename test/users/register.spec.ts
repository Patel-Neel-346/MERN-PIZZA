import request from 'supertest';
import app from '../../src/app';

describe('POST /auth/register', () => {
    describe('Given All Fields', () => {
        it('should return 200 status code', async () => {
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
    });
    describe('Missing Fields', () => {});
});
