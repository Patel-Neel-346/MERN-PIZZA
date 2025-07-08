import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import bcrypt from 'bcrypt';
import { Roles } from '../../src/constants';
import request from 'supertest';
import app from '../../src/app';
import { strict } from 'assert';
import { isJWT } from '../utiles';
// import createJWKMock from 'mock-jwks';
import createJWKSMock from 'mock-jwks';

describe('POST /auth/login', () => {
    let Connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:5501');
        Connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await Connection?.dropDatabase();
        await Connection?.synchronize();
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await Connection.destroy();
    });

    //happy path
    describe('Given All Fields ', () => {
        it.skip('should return 200 status code ', async () => {
            const respone = await request(app).get('/auth/self').send();
            expect(respone.statusCode).toBe(200);
        });

        it('should return User data ', async () => {
            // expect(respone.statusCode).toBe(200);
            //1.register user register
            //2.generate token and add token to cookie
            //3. assert check if user id match with register user

            const userData = {
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: 'secret',
                role: Roles.CUSTOMER,
            };
            const userRepository = Connection.getRepository(User);
            const data = await userRepository.save({
                ...userData,
            });

            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
                email: data.email,
            });

            const reponse = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken};`])
                .send();

            //assert

            console.log(reponse.body);

            expect((reponse.body as Record<string, string>).id).toBe(data.id);
        });
    });
    //sad path

    describe('Fields Are Missing ', () => {});
});
