import app from './app';
import { serverConfig } from './config';
import { AppDataSource } from './config/data-source';
import logger from './config/logger';

const startServer = async () => {
    try {
        const PORT = serverConfig.PORT || 5000;
        await AppDataSource.initialize();
        logger.info('database connected to Postgres Server');
        app.listen(PORT, () => {
            // console.log(`Server is running on port ${PORT}`);
            logger.error('Error');
            logger.info('Listening on port', { port: PORT });
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error(error.message);
            setTimeout(() => {
                process.exit(1);
            }, 1000);
        }
    }
};

void startServer();
