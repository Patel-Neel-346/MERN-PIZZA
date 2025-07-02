import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import logger from './config/logger';

const app = express();

app.get('/', (_req: express.Request, res: express.Response) => {
    res.send('Hello World Neel Patel! HI Neel Patel');
});

app.post(
    '/auth/register',
    (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) => {
        res.status(201).json();
    },
);
//global error handler and alwayes last in all routes
//added ERROR Handler

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: '',
                location: '',
            },
        ],
    });
});

export default app;
