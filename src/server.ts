import app from './app';
import { serverConfig } from './config';

const startServer = () => {
    try {
        const PORT = serverConfig.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting the server:', error);
        process.exit(1);
    }
};

startServer();
