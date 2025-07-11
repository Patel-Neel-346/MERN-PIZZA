import { Logger } from 'winston';
import { UserService } from '../services/userService';
import { Request, Response, NextFunction } from 'express';

export class UserController {
    constructor(
        private readonly userservice: UserService,
        private readonly logger: Logger,
    ) {}

    async CreateNewUser(req: Request, res: Response, next: NextFunction) {}

    async UpdateUser(req: Request, res: Response, next: NextFunction) {}

    async getAllData(req: Request, res: Response, next: NextFunction) {}

    async getUserDataById(req: Request, res: Response, next: NextFunction) {}

    async DeleteUser(req: Request, res: Response, next: NextFunction) {}
}
