import { Response, NextFunction } from 'express';
import { AuthRequest, RegisterUserRequest } from '../types';
import { UserService } from '../services/userService';
import { Logger } from 'winston';
import createHttpError from 'http-errors';
import { validationResult } from 'express-validator';
import { JwtPayload, sign } from 'jsonwebtoken';
import { TokenService } from '../services/TokenService';
import { RefreshToken } from '../entity/RefreshToken';
import { CredentialService } from '../services/CredentialService';
import { Roles } from '../constants';
export class AuthController {
    constructor(
        private readonly userService: UserService,
        private readonly logger: Logger,
        private readonly tokenService: TokenService,
        private readonly credentialService: CredentialService,
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
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            const newRefreshToken: RefreshToken =
                await this.tokenService.persistRefreshToken(user);
            const id = newRefreshToken.id;
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id,
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
                maxAge: 1000 * 60 * 60 * 24 * 365,
                httpOnly: true,
            });
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

            if (user.role === Roles.MANAGER) {
                payload.tenant = user.tenats?.id;
            }

            const accessToken = this.tokenService.generateAccessToken(payload);

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
                maxAge: 1000 * 60 * 60 * 24 * 365,
                httpOnly: true,
            });

            res.status(200).json({
                id: user.id,
                message: 'Success login ',
            });
        } catch (error) {
            next(error);
            return;
        }
    }

    async self(req: AuthRequest, res: Response, next: NextFunction) {
        const user = await this.userService.findByid(req.auth.sub);
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
            if (user.role === Roles.MANAGER) {
                payload.tenant = user.tenats?.id;
            }
            const accessToken = this.tokenService.generateAccessToken(payload);

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
                maxAge: 1000 * 60 * 60 * 24 * 365,
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
            console.log(req.auth);
            await this.tokenService.deleteRefreshToken(Number(req.auth.sub));
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
