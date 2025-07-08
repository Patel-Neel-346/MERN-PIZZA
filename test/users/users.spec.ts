import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';
import request from 'supertest';
import app from '../../src/app';
import { isJWT } from '../utiles';
import createJWKSMock from 'mock-jwks';

describe('POST /auth/login', () => {
  let connection: DataSource;
  const jwksOrigin = 'http://localhost:5501'; 
  const jwksPath = '/well-known/jwks.json';
  const jwks = createJWKSMock(jwksOrigin, jwksPath); 

  beforeAll(async () => {
   
    process.env.JWKS_URL = `${jwksOrigin}${jwksPath}`;

  
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await jwks.start(); 
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterEach(() => {
    jwks.stop(); 
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe('Given All Fields', () => {
    it('should return User data', async () => {
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

      const response = await request(app)
        .get('/auth/self')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send();

      console.log('Response:', response.body);

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(savedUser.id);
    });
  });

  describe('Fields Are Missing', () => {
   
  });
});
