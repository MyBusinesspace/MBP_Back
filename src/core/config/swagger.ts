import swaggerJsdoc from 'swagger-jsdoc';
import { join } from 'path';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'MyBusinesSpace API',
            version: '1.0.0',
            description:
                'REST API for MyBusinesSpace - Business management system with Google OAuth authentication, teams, projects and contacts',
            contact: {
                name: 'API Support',
                email: 'support@mybusinesspace.com',
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
        },
        servers: [
            {
                url:
                    process.env.NODE_ENV === 'production'
                        ? 'https://api.mybusinesspace.com'
                        : `http://localhost:${process.env.PORT || 3001}`,
                description:
                    process.env.NODE_ENV === 'production'
                        ? 'Production Server'
                        : 'Development Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description:
                        'Enter the JWT token obtained after authenticating with Google OAuth',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        message: {
                            type: 'string',
                            example: 'Error message description',
                        },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        userId: {
                            type: 'string',
                            format: 'uuid',
                            example: '123e4567-e89b-12d3-a456-426614174000',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'user@example.com',
                        },
                        name: {
                            type: 'string',
                            example: 'John Doe',
                        },
                    },
                },
                Company: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        name: {
                            type: 'string',
                            example: 'Acme Corporation',
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: 'Authentication',
                description: 'Authentication endpoints with Google OAuth and session management',
            },
            {
                name: 'Health',
                description: 'API health check endpoints',
            },
        ],
    },
    apis: [join(__dirname, '../../modules/**/routes.ts'), join(__dirname, '../api/**/routes.ts')],
};

// Generate spec lazily
let cachedSpec: any = null;

export function getSwaggerSpec() {
    if (!cachedSpec) {
        cachedSpec = swaggerJsdoc(options);
    }
    return cachedSpec;
}
