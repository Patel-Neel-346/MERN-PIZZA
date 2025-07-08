import { expressjwt } from 'express-jwt';
import { expressJwtSecret, JwksClient } from 'jwks-rsa';
import { serverConfig } from '../config';
import { Request } from 'express';
// JwksClient

export default expressjwt({
    secret: expressJwtSecret({
        // jwksUri: serverConfig.JWKS_URL!,

        jwksUri:
            serverConfig.JWKS_URL! ||
            'http://localhost:5501/well-known/jwks.json',
        cache: true,
        rateLimit: true,
    }),
    algorithms: ['RS256'],
    getToken(req: Request): string {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.split(' ')[1] !== 'undefined') {
            const token = authHeader.split(' ')[1];
            if (token) {
                return token;
            }
        }

        type AuthCookie = {
            accessToken: string;
        };
        const { accessToken } = req.cookies as AuthCookie;
        return accessToken;
    },
});
