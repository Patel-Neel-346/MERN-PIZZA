import 'reflect-metadata';
import express from 'express';
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
app.use(GlobalErrorHandler);
export default app;
