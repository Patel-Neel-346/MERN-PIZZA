import app from './app';
import { serverConfig } from './config';
import logger from './config/logger';

const startServer = () => {
    try {
        const PORT = serverConfig.PORT || 5000;

        app.listen(PORT, () => {
            // console.log(`Server is running on port ${PORT}`);
            logger.error('Error');
            logger.info('Listening on port', { port: PORT });
        });
    } catch (error) {
        console.error('Error starting the server:', error);
        process.exit(1);
    }
};

startServer();
