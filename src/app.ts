import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import logger from './config/logger';
import TenantsRouter from './routes/TenantsRoutes';
import cookieParser from 'cookie-parser';
import { GlobalErrorHandler } from './middleware/GlobalErrorHandler';
import path from 'path';
import AuthRouter from './routes/AuthRoutes';
import UserRouter from './routes/UserRoutes';
const app = express();

app.use(express.json());
app.use(cookieParser());
const publicDirPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicDirPath));

app.get('/', (_req: express.Request, res: express.Response) => {
    res.send('Hello World Neel Patel! HI Neel Patel');
});
//routes
app.use('/auth', AuthRouter);
app.use('/tenants', TenantsRouter);
app.use('/users', UserRouter);
//global error handler and alwayes last in all routes
//added ERROR Handler

// app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
//     logger.error(err.message);
//     const statusCode = err.statusCode || 500;

//     res.status(statusCode).json({
//         errors: [
//             {
//                 type: err.name,
//                 msg: err.message,
//                 path: '',
//                 location: '',
//             },
//         ],
//     });
// });

//global error handler
app.use(GlobalErrorHandler);
export default app;
