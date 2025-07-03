import winston from 'winston';
import { serverConfig } from '.';

const logger = winston.createLogger({
    level: 'info',
    defaultMeta: {
        serviceName: 'auth-service',
    },
    transports: [
        new winston.transports.Console({
            level: 'info',
            format: winston.format.combine(
                winston.format.json(),
                winston.format.timestamp(),
                winston.format.prettyPrint(),
            ),
            silent: serverConfig.NODEENV == 'test' ? true : false,
        }),

        new winston.transports.File({
            level: 'info',
            format: winston.format.combine(
                winston.format.json(),
                winston.format.timestamp(),
                winston.format.prettyPrint(),
            ),
            dirname: 'logs',
            filename: 'index.log',
        }),

        new winston.transports.File({
            level: 'error',
            format: winston.format.combine(
                winston.format.json(),
                winston.format.timestamp(),
                winston.format.prettyPrint(),
            ),
            dirname: 'logs',
            filename: 'error.log',
        }),
        new winston.transports.File({
            level: 'debug',
            format: winston.format.combine(
                winston.format.json(),
                winston.format.timestamp(),
                winston.format.prettyPrint(),
            ),
            dirname: 'logs',
            filename: 'debug.log',
        }),
    ],
});

export default logger;
