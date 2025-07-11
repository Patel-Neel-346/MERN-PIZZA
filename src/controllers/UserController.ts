import { Logger } from 'winston';
import { UserService } from '../services/userService';
import { Request, Response, NextFunction } from 'express';
import { CreateUserRequest } from '../types';

export class UserController {
    constructor(
        private readonly userservice: UserService,
        private readonly logger: Logger,
    ) {}

    async CreateNewUser(
        req: CreateUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        //validation

        const { firstName, lastName, email, password, tenantId, role } =
            req.body;

        try {
            const user = await this.userservice.createUser({
                firstName,
                lastName,
                email,
                password,
                role,
                tenantId,
            });

            res.status(201).json({
                id: user.id,
            });
        } catch (error) {
            next(error);
        }
    }

    async UpdateUser(req: Request, res: Response, next: NextFunction) {}

    async getAllData(req: Request, res: Response, next: NextFunction) {}

    async getUserDataById(req: Request, res: Response, next: NextFunction) {}

    async DeleteUser(req: Request, res: Response, next: NextFunction) {}
}
