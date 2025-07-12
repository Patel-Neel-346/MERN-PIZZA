import express, { Request, Response, NextFunction } from 'express';
import authenticate from '../middleware/authenticate';
import { CanAccess } from '../middleware/CanAccess';
import { Roles } from '../constants';
import registerValidator from '../validators/register-validator';
import { AuthController } from '../controllers/AuthController';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import { UserService } from '../services/userService';
import { UserController } from '../controllers/UserController';
import logger from '../config/logger';
import UpdateUserValidator from '../validators/Update-user-validator';
import ListUserValidatior from '../validators/List-User-Validatior';

const UserRouter = express.Router();

const userRepository = AppDataSource.getRepository(User);

const userService = new UserService(userRepository);

const usercontroller = new UserController(userService, logger);

//createing user
UserRouter.post(
    '/',
    authenticate,
    CanAccess([Roles.ADMIN]),
    registerValidator,
    (req: Request, res: Response, next: NextFunction) =>
        usercontroller.CreateNewUser(req, res, next),
);

//update user data by id
UserRouter.patch(
    '/:id',
    authenticate,

    CanAccess([Roles.ADMIN]),
    UpdateUserValidator,
    (req: Request, res: Response, next: NextFunction) =>
        usercontroller.UpdateUser(req, res, next),
);

//get all userdata according to pagination

UserRouter.get(
    '/',
    authenticate,
    CanAccess([Roles.ADMIN]),
    ListUserValidatior,
    (req: Request, res: Response, next: NextFunction) =>
        usercontroller.getAllData(req, res, next),
);

//get one userData By ID

UserRouter.get(
    '/:id',
    authenticate,
    CanAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        usercontroller.getUserDataById(req, res, next),
);

//delete user from db
UserRouter.delete(
    '/:id',
    authenticate,
    CanAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        usercontroller.DeleteUser(req, res, next),
);

export default UserRouter;
