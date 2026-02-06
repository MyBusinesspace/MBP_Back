import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { join } from 'path';
import { healthRouter } from './api/health/routes';
import { getSwaggerSpec } from './config/swagger';
import { requestLogger } from '@/middleware/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFound';
import { RouteLoader } from '@/utils/routeLoader';
import { logger } from '@/utils/logger';

export class App {
    public app: Application;
    private routeLoader: RouteLoader;

    constructor() {
        this.app = express();
        this.routeLoader = new RouteLoader(join(__dirname, '../modules'));
        this.initializeMiddlewares();
        this.initialize();
    }

    private initializeMiddlewares(): void {
        // Security
        this.app.use(helmet());
        this.app.use(
            cors({
                origin: process.env.FRONTEND_URL || 'http://localhost:5173',
                credentials: true,
            })
        );

        // Body parsing
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        // Logging
        this.app.use(requestLogger);
    }

    private async initialize(): Promise<void> {
        await this.initializeRoutes();
        this.initializeErrorHandling();
    }

    private async initializeRoutes(): Promise<void> {
        // Core routes
        this.app.use('/api', healthRouter);

        // API Documentation (Swagger) - Setup with spec document
        const swaggerSpec = getSwaggerSpec();
        this.app.use(
            '/api-docs',
            swaggerUi.serve,
            swaggerUi.setup(swaggerSpec, {
                customCss: '.swagger-ui .topbar { display: none }',
                customSiteTitle: 'MyBusinesSpace API Docs',
                swaggerOptions: {
                    persistAuthorization: true,
                },
            })
        );

        // Dynamically load module routes
        const moduleRoutes = await this.routeLoader.loadModuleRoutes();

        for (const { router, moduleName } of moduleRoutes) {
            this.app.use('/api', router);
            logger.info(`Registered routes for module: ${moduleName}`);
        }

        logger.info(`Total modules loaded: ${moduleRoutes.length}`);
    }

    private initializeErrorHandling(): void {
        // 404 handler
        this.app.use(notFoundHandler);

        // Global error handler
        this.app.use(errorHandler);
    }

    public getExpressApp(): Application {
        return this.app;
    }
}
