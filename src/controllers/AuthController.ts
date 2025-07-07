import { Request, Response, NextFunction } from 'express';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/userService';
import { Logger } from 'winston';
import createHttpError from 'http-errors';
import { validationResult } from 'express-validator';
import { JwtPayload, sign } from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { serverConfig } from '../config';
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

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };
            const privateKey = fs.readFileSync(
                path.join(__dirname, '../../certs/private.pem'),
            );

            const PrivateKey = privateKey
                .toString()
                .replace('-----BEGIN RSA PRIVATE KEY-----', '')
                .replace('-----END RSA PRIVATE KEY-----', '')
                .replace(/\r?\n|\r/g, '')
                .trim();

            const accessToken = sign(payload, PrivateKey, {
                algorithm: 'HS256',
                expiresIn: '1h', // 1 hour
                issuer: 'auth-service',
            });
            const refreshToken = sign(
                payload,
                serverConfig.REFRESH_TOKEN_SECRET!,
                {
                    algorithm: 'HS256',
                    expiresIn: '1h', // 1 hour
                    issuer: 'auth-service',
                },
            );

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60,
                httpOnly: true,
            });
            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, // 100
                httpOnly: true,
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
