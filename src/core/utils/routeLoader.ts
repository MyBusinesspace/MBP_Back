import { Router } from 'express';
import { readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';
import { logger } from './logger';

interface ModuleRoutes {
    router: Router;
    moduleName: string;
}

export class RouteLoader {
    private modulesPath: string;

    constructor(modulesPath: string) {
        this.modulesPath = modulesPath;
    }

    /**
     * Load all routes from modules directory
     */
    async loadModuleRoutes(): Promise<ModuleRoutes[]> {
        const routes: ModuleRoutes[] = [];

        try {
            const modules = this.getModuleDirectories();

            for (const moduleName of modules) {
                try {
                    // Try to import the routes file
                    const routeModule = await this.importRouteModule(moduleName);

                    if (!routeModule) {
                        logger.warn(`No routes file found in module: ${moduleName}`);
                        continue;
                    }

                    // Look for exported router
                    const router = this.findRouter(routeModule, moduleName);

                    if (router) {
                        routes.push({ router, moduleName });
                        logger.info(`Loaded routes from module: ${moduleName}`);
                    } else {
                        logger.warn(`No router found in module: ${moduleName}`);
                    }
                } catch (error: any) {
                    logger.warn(`Failed to load routes from module: ${moduleName}`, {
                        error: error.message,
                        stack: error.stack,
                    });
                }
            }
        } catch (error: any) {
            logger.error('Failed to load module routes', {
                error: error.message,
                stack: error.stack,
            });
        }

        return routes;
    }

    /**
     * Import route module (handles both .ts and .js)
     */
    private async importRouteModule(moduleName: string): Promise<any> {
        const extensions = ['.ts', '.js', ''];

        for (const ext of extensions) {
            const routePath = join(this.modulesPath, moduleName, `routes${ext}`);

            if (existsSync(routePath)) {
                try {
                    return await import(routePath);
                } catch (error) {
                    throw error;
                }
            }
        }

        return null;
    }

    /**
     * Get all module directories
     */
    private getModuleDirectories(): string[] {
        try {
            const items = readdirSync(this.modulesPath);

            return items.filter((item) => {
                const itemPath = join(this.modulesPath, item);
                const isDirectory = statSync(itemPath).isDirectory();
                const hasRoutesFile = this.hasRoutesFile(itemPath);
                return isDirectory && hasRoutesFile;
            });
        } catch (error: any) {
            logger.error('Failed to read modules directory', {
                error: error.message,
            });
            return [];
        }
    }

    /**
     * Check if directory has a routes file
     */
    private hasRoutesFile(dirPath: string): boolean {
        const extensions = ['.ts', '.js', ''];

        for (const ext of extensions) {
            try {
                const routesPath = join(dirPath, `routes${ext}`);
                if (existsSync(routesPath)) {
                    return true;
                }
            } catch {
                // Continue checking other extensions
            }
        }

        return false;
    }

    /**
     * Find router export from module (supports multiple naming conventions)
     */
    private findRouter(routeModule: any, moduleName: string): Router | null {
        // Try common naming patterns
        const possibleNames = [
            `${moduleName}Router`, // e.g., authRouter
            'router', // generic router
            'default', // default export
        ];

        for (const name of possibleNames) {
            if (routeModule[name] && this.isRouter(routeModule[name])) {
                return routeModule[name];
            }
        }

        return null;
    }

    /**
     * Check if object is an Express Router
     */
    private isRouter(obj: any): obj is Router {
        return obj && typeof obj === 'function' && 'use' in obj && 'get' in obj;
    }
}
