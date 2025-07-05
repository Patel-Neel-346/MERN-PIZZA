import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import logger from './config/logger';
import UserRouter from './routes/UserRoutes';
import cookieParser from 'cookie-parser';
const app = express();

app.use(express.json());
app.use(cookieParser());
app.get('/', (_req: express.Request, res: express.Response) => {
    res.send('Hello World Neel Patel! HI Neel Patel');
});
//routes
app.use('/auth', UserRouter);
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
