import { Request, Response, NextFunction } from 'express';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/userService';
export class AuthController {
    public userService;
    constructor(userService: UserService) {
        this.userService = userService;
    }
    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        const { firstName, lastName, email, password } = req.body;
        try {
            const user = await this.userService.createUser({
                firstName,
                lastName,
                email,
                password,
            });

            // console.log(user);

            res.status(201).json({ user });
        } catch (err) {
            next(err);
            return;
        }
    }
}
