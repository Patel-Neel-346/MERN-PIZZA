import { Request, Response, NextFunction } from 'express';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/userService';
import { Logger } from 'winston';
import createHttpError from 'http-errors';
import { validationResult } from 'express-validator';

export class AuthController {
    public userService;
    constructor(
        userService: UserService,
        public logger: Logger,
    ) {
        this.userService = userService;
    }
    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            res.status(400).json({
                errors: result.array(),
                // return;
            });
            return;
        }
        const { firstName, lastName, email, password, role } = req.body;
        this.logger.debug('New Request To register a User', {
            firstName,
            lastName,
            email,
            password: '*****',
        });

        try {
            const user = await this.userService.createUser({
                firstName,
                lastName,
                email,
                password,
                role,
            });

            // console.log(user);

            this.logger.info('User has been Register:::)', { user });
            res.status(201).json({ user });
        } catch (err) {
            next(err);
            return;
        }
    }
}
