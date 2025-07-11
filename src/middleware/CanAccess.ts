import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '../types';
import createHttpError from 'http-errors';

export const CanAccess = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // const role = req.auth;

        const _req = req as AuthRequest;
        const roleFromToken = _req.auth.role;

        if (!roles.includes(roleFromToken)) {
            const error = createHttpError(
                403,
                `You dont have access,${roles} can only Access this routes to better luck next time buddy`,
            );

            next(error);
            return;
        }

        next();
    };
};
