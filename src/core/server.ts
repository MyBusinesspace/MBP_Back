import { config } from 'dotenv';
config();

import { App } from './app';
import { logger } from '@/utils/logger';
import { prisma } from '@/database/prisma';

class Server {
    private app: App;
    private port: number;

    constructor() {
        this.app = new App();
        this.port = parseInt(process.env.PORT || '3000', 10);
    }

    public async start(): Promise<void> {
        try {
            // Test database connection
            await this.connectDatabase();

            // Start HTTP server
            this.app.getExpressApp().listen(this.port, () => {
                logger.info(`Server started successfully`, {
                    port: this.port,
                    environment: process.env.NODE_ENV || 'development',
                    nodeVersion: process.version,
                });
            });

            // Graceful shutdown handlers
            this.setupGracefulShutdown();
        } catch (error) {
            logger.error('Failed to start server', { error });
            process.exit(1);
        }
    }

    private async connectDatabase(): Promise<void> {
        try {
            await prisma.$connect();
            logger.info('Database connected successfully');
        } catch (error) {
            logger.error('Database connection failed', { error });
            throw error;
        }
    }

    private setupGracefulShutdown(): void {
        const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];

        signals.forEach((signal) => {
            process.on(signal, async () => {
                logger.info(`${signal} received, starting graceful shutdown`);

                try {
                    // Close database connection
                    await prisma.$disconnect();
                    logger.info('Database disconnected');

                    // Exit process
                    logger.info('Graceful shutdown completed');
                    process.exit(0);
                } catch (error) {
                    logger.error('Error during graceful shutdown', { error });
                    process.exit(1);
                }
            });
        });

        // Handle uncaught errors
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught exception', { error });
            process.exit(1);
        });

        process.on('unhandledRejection', (reason) => {
            logger.error('Unhandled rejection', { reason });
            process.exit(1);
        });
    }
}

// Start server
const server = new Server();
server.start();
