import { config } from 'dotenv';

config();

const { PORT, NodeENV } = process.env;

export const serverConfig = {
    PORT,
    NodeENV,
};
