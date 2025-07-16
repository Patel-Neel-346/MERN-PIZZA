import express, { Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/AuthController';
import { UserService } from '../services/userService';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import logger from '../config/logger';
import registerValidator from '../validators/register-validator';
import { TokenService } from '../services/TokenService';
import { RefreshToken } from '../entity/RefreshToken';
import loginValidator from '../validators/login-validator';
import { CredentialService } from '../services/CredentialService';
import authenticate from '../middleware/authenticate';
import { AuthRequest } from '../types';
import validateRefreshToken from '../middleware/validateRefreshToken';
import parseRefreshToken from '../middleware/parseRefreshToken';

const AuthRouter = express.Router();


const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepositroy = AppDataSource.getRepository(RefreshToken);


const userService = new UserService(userRepository);
const tokenService = new TokenService(refreshTokenRepositroy);
const credentialService = new CredentialService();
const authcontroller = new AuthController(
    userService,
    logger,
    tokenService,
    credentialService,
);

AuthRouter.post(
    '/register',
    registerValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authcontroller.register(req, res, next),
);

AuthRouter.post(
    '/login',
    loginValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authcontroller.login(req, res, next),
);

AuthRouter.get(
    '/self',
    authenticate,
    (req: Request, res: Response, next: NextFunction) =>
        authcontroller.self(req as AuthRequest, res, next),
);

AuthRouter.post(
    '/refresh',
    validateRefreshToken,
    (req: Request, res: Response, next: NextFunction) =>
        authcontroller.refresh(req as AuthRequest, res, next),
);

AuthRouter.get(
    '/logout',
    parseRefreshToken,
    (req: Request, res: Response, next: NextFunction) =>
        authcontroller.logout(req as AuthRequest, res, next),
);
export default AuthRouter;
