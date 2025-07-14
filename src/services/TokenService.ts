import { Repository } from 'typeorm';
import { RefreshToken } from '../entity/RefreshToken';
import { JwtPayload, sign } from 'jsonwebtoken';
import { serverConfig } from '../config';
import createHttpError from 'http-errors';
import { User } from '../entity/User';
import { loadPrivateKey } from '../config/keys';

export class TokenService {
    constructor(
        private readonly refreshTokenRepository: Repository<RefreshToken>,
    ) {}

    generateAccessToken(payload: JwtPayload) {
        try {
            const PrivateKey = loadPrivateKey();
            const accessToken = sign(payload, PrivateKey, {
                algorithm: 'RS256',
                expiresIn: '1h',
                issuer: 'auth-server',
            });

            if (!accessToken) {
                const error = createHttpError(
                    500,
                    'Failed to Create AccessToken pls Try again',
                );
                throw error;
            }

            return accessToken;
        } catch (error) {
            return error;
        }
    }

    generateRefreshToken(payload: JwtPayload) {
        // let privateKey;

        // if (!serverConfig.REFRESH_TOKEN_SECRET) {
        //     const error = createHttpError(
        //         500,
        //         'error while reading private key',
        //     );
        //     throw error;
        // }

        try {
            // const refreshToken = ;
            const refreshToken = sign(
                payload,
                serverConfig.REFRESH_TOKEN_SECRET!,
                {
                    algorithm: 'HS256',
                    expiresIn: '1y',
                    issuer: 'auth-server',
                    jwtid: String(payload.id),
                },
            );

            if (!refreshToken) {
                const error = createHttpError(
                    500,
                    'Failed to Create RefreshToken pls Try again',
                );
                throw error;
            }

            return refreshToken;
        } catch (error) {
            return error;
        }
    }

    async persistRefreshToken(user: User) {
        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365; // -> 1 Year
        const newRefreshToken = await this.refreshTokenRepository.save({
            user: user,
            expiresAt: new Date(Date.now() + MS_IN_YEAR),
        });

        return newRefreshToken;
    }

    async deleteRefreshToken(tokenId: number) {
        return await this.refreshTokenRepository.delete({ id: tokenId });
    }
}
