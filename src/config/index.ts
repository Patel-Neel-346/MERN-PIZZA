import { config } from 'dotenv';
import path from 'path';
import logger from './logger';

config({
    path: path.join(__dirname, `../../.env.${process.env.NODEENV}`),
});

const { PORT, NODEENV, DB_HOST, DB_PORT, DB_PASSWORD, DB_NAME, DB_USERNAME } =
    process.env;

export const serverConfig = {
    PORT,
    NODEENV,
    DB_HOST,
    DB_PORT,
    DB_PASSWORD,
    DB_NAME,
    DB_USERNAME,
};
