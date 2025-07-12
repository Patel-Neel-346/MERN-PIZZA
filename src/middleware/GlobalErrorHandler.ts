import { HttpError } from 'http-errors';
import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { v4 as uuidv4 } from 'uuid';
export const GlobalErrorHandler = (
    err: HttpError,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const errorId = uuidv4();
    const statusCode = err.statusCode || err.status || 500;
    const isProduction = process.env.NODEENV === 'prod';
    const message = isProduction ? 'Internel server Error' : err.message;
    logger.error(err.message, {
        id: errorId,
        statusCode,
        error: err.stack,
        path: req.path,
        method: req.method,
    });

    // console.log(err);
    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: message,
                path: req.path,
                location: 'server',
                method: req.method,
                stack: isProduction ? null : err.stack,
            },
        ],
    });
};
