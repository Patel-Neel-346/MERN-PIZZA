import express, { Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/AuthController';
import { UserService } from '../services/userService';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import logger from '../config/logger';
import registerValidator from '../validators/register-validator';
import { TokenService } from '../services/TokenService';
import { RefreshToken } from '../entity/RefreshToken';
// import { body } from 'express-validator';

//router
const UserRouter = express.Router();

//repository instance to pass in controller
const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepositroy = AppDataSource.getRepository(RefreshToken);

//class instance
const userService = new UserService(userRepository);
const tokenService = new TokenService(refreshTokenRepositroy);
const authcontroller = new AuthController(userService, logger, tokenService);

UserRouter.post(
    '/register',
    registerValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authcontroller.register(req, res, next),
);
export default UserRouter;
