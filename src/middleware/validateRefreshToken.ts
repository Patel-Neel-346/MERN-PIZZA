import { expressjwt } from 'express-jwt';
import { Request } from 'express';
import { serverConfig } from '../config';
import { AppDataSource } from '../config/data-source';
import { RefreshToken } from '../entity/RefreshToken';
import { IRefreshTokenPayload } from '../types';
import logger from '../config/logger';

export default expressjwt({
    secret: serverConfig.REFRESH_TOKEN_SECRET!,
    algorithms: ['HS256'],
    getToken(req: Request): string {
        const { refreshToken } = req.cookies as Record<string, string>;
        return refreshToken;
    },
    async isRevoked(req: Request, token) {
        try {
            const refreshTokenRepository =
                AppDataSource.getRepository(RefreshToken);

            const refreshToken = await refreshTokenRepository.findOne({
                where: {
                    id: Number((token?.payload as IRefreshTokenPayload).id),
                    user: {
                        id: Number(token?.payload?.sub),
                    },
                },
            });

            return refreshToken === null;
        } catch (error) {
            logger.error('error while getting the refresh token', {
                id: Number((token?.payload as IRefreshTokenPayload).id),
            });
        }
        return true;
    },
});
