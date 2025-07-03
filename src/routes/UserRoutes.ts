import express from 'express';
import { AuthController } from '../controllers/AuthController';
import { UserService } from '../services/userService';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import logger from '../config/logger';

const UserRouter = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authcontroller = new AuthController(userService, logger);

UserRouter.post('/register', (req, res, next) =>
    authcontroller.register(req, res, next),
);
export default UserRouter;
