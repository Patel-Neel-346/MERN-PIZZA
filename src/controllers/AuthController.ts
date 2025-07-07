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
import { TokenService } from '../services/TokenService';
import { RefreshToken } from '../entity/RefreshToken';
export class AuthController {
    constructor(
        private readonly userService: UserService,
        private readonly logger: Logger,
        private readonly tokenService: TokenService,
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

            // const payload: JwtPayload = {
            //     sub: String(user.id),
            //     role: user.role,
            // };
            // const privateKey = fs.readFileSync(
            //     path.join(__dirname, '../../certs/private.pem'),
            // );

            // const PrivateKey = privateKey
            //     .toString()
            //     .replace('-----BEGIN RSA PRIVATE KEY-----', '')
            //     .replace('-----END RSA PRIVATE KEY-----', '')
            //     .replace(/\r?\n|\r/g, '')
            //     .trim();

            // const accessToken = sign(payload, PrivateKey, {
            //     algorithm: 'HS256',
            //     expiresIn: '1h', // 1 hour
            //     issuer: 'auth-service',
            // });
            // const refreshToken = sign(
            //     payload,
            //     serverConfig.REFRESH_TOKEN_SECRET!,
            //     {
            //         algorithm: 'HS256',
            //         expiresIn: '7d', // 1 hour
            //         issuer: 'auth-service',
            //     },
            // );

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            };
            //generate accessToken
            const accessToken = this.tokenService.generateAccessToken(payload);

            const newRefreshToken: RefreshToken =
                await this.tokenService.persistRefreshToken(user);
            //generate refreshToken

            // if (!newRefreshToken) {
            //     const error = createHttpError(
            //         500,
            //         'Faild to Create New RefreshToken Data in Database',
            //     );
            //     next(error);
            //     return;
            // }
            const id = newRefreshToken.id;
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id,
            });

            console.log('AcccessToken:', accessToken);
            console.log('RefrehToken', refreshToken);
            console.log('Persistant Token:', newRefreshToken);

            //generate presist refresh token
            // this.tokenService.persistRefreshToken({ ...user , id:refreshToken.id})
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
