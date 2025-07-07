import { config } from 'dotenv';
import path from 'path';
// import logger from './logger';

config({
    path: path.join(__dirname, `../../.env.dev`),
});

const {
    PORT,
    NODEENV,
    DB_HOST,
    DB_PORT,
    DB_PASSWORD,
    DB_NAME,
    DB_USERNAME,
    REFRESH_TOKEN_SECRET,
} = process.env;

export const serverConfig = {
    PORT,
    NODEENV,
    DB_HOST,
    DB_PORT,
    DB_PASSWORD,
    DB_NAME,
    DB_USERNAME,
    REFRESH_TOKEN_SECRET,
};
