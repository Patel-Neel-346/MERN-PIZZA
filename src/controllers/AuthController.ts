import { Request, Response, NextFunction } from 'express';
import { AuthRequest, RegisterUserRequest } from '../types';
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
import { CredentialService } from '../services/CredentialService';
export class AuthController {
    constructor(
        private readonly userService: UserService,
        private readonly logger: Logger,
        private readonly tokenService: TokenService,
        private readonly credentialService: CredentialService,
    ) {
        this.userService = userService;
    }

    readPrivateKey() {
        const privateKey = fs.readFileSync(
            path.join(__dirname, '../../certs/private.pem'),
        );

        return privateKey;
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

            const privateKey = this.readPrivateKey();

            if (!privateKey) {
                const error = createHttpError(
                    500,
                    'faild to read private key from certs floder',
                );

                next(error);
                return;
            }
            const accessToken = this.tokenService.generateAccessToken(
                payload,
                privateKey,
            );

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

            // console.log('AcccessToken:', accessToken);
            // console.log('RefrehToken', refreshToken);
            // console.log('Persistant Token:', newRefreshToken);

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

    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);

        if (!result.isEmpty()) {
            res.status(400).json({
                errors: result.array(),
            });
            return;
        }

        const { email, password } = req.body;
        //debug userData
        this.logger.debug('new request to login User', {
            email,
            password: '*************',
        });

        try {
            const user = await this.userService.findByEmailWithPassword(email);

            if (!user) {
                const error = createHttpError(
                    404,
                    'User Not Found Pls Register First :) ',
                );
                next(error);
                return;
            }

            const passwordMatch = await this.credentialService.comparePassword(
                password,
                user.password,
            );

            if (!passwordMatch) {
                const error = createHttpError(400, 'Invalid Credentails');
                next(error);
                return;
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            };

            const privateKey = this.readPrivateKey();

            if (!privateKey) {
                const error = createHttpError(
                    500,
                    'faild to read private key from certs floder',
                );

                next(error);
                return;
            }
            const accessToken = this.tokenService.generateAccessToken(
                payload,
                privateKey,
            );

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: newRefreshToken.id,
            });

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60,
                httpOnly: true,
            });

            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, //1y
                httpOnly: true,
            });

            res.status(200).json({
                id: user.id,
                message: 'Success login ',
            });
        } catch (error) {
            // console.log(error);
            next(error);
            return;
        }
    }

    async self(req: AuthRequest, res: Response, next: NextFunction) {
        // console.log(req.auth);

        const user = await this.userService.findByid(req.auth.sub);
        // console.log('User come from DB:', user);
        res.json(user);
    }

    async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const payload: JwtPayload = {
                sub: String(req.auth.sub),
                role: req.auth.role,
                firstname: req.auth.firstName,
                lastName: req.auth.lastName,
                email: req.auth.email,
            };

            const user = await this.userService.findByid(req.auth.sub);

            if (!user) {
                const error = createHttpError(
                    400,
                    'Invalid User Credentials! ',
                );
                next(error);
                return;
            }

            //create token for user to send

            const privateKey = this.readPrivateKey();

            if (!privateKey) {
                const error = createHttpError(
                    500,
                    'faild to read private key from certs floder',
                );

                next(error);
                return;
            }
            const accessToken = this.tokenService.generateAccessToken(
                payload,
                privateKey,
            );

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: newRefreshToken.id,
            });

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60, // 1m
                httpOnly: true,
            });

            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1Y
                httpOnly: true,
            });

            res.status(200).json({
                success: 'True',
                message:
                    'Your Access &  refresh token has been Updated SuccessFuly 😁',
                accessToken,
                refreshToken,
            });
        } catch (error) {
            next(error);
        }
    }

    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));
            this.logger.info('refresh token has been Deleted!', {
                token: req.auth.id,
            });

            this.logger.info('User has been logged out', {
                userId: req.auth.sub,
            });

            res.clearCookie('refreshToken');
            res.clearCookie('accessToken');
            res.json({
                message: 'User has been SuccesFully log out',
            });
        } catch (error) {
            next(error);
        }
    }
}
