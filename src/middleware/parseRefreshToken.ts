import { serverConfig } from '../config';
import { expressjwt } from 'express-jwt';
import { Request } from 'express';
export default expressjwt({
    secret: serverConfig.REFRESH_TOKEN_SECRET!,
    algorithms: ['HS256'],
    getToken(req: Request) {
        const { refreshToken } = req.cookies as Record<string, string>;
        console.log('geting token ', refreshToken);
        return refreshToken;
    },
});
