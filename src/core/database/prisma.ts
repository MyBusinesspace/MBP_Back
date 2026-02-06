import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { logger } from '../utils/logger';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not defined');
}

// Create PostgreSQL connection pool
const pool = new pg.Pool({
    connectionString,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Create Prisma client instance
export const prisma = new PrismaClient({
    adapter,
    log: [
        {
            emit: 'event',
            level: 'query',
        },
        {
            emit: 'event',
            level: 'error',
        },
        {
            emit: 'event',
            level: 'warn',
        },
    ],
});

// Log queries in development
if (process.env.NODE_ENV === 'development') {
    prisma.$on('query', (e: any) => {
        logger.debug('Query', {
            query: e.query,
            params: e.params,
            duration: `${e.duration}ms`,
        });
    });
}

// Log errors
prisma.$on('error', (e: any) => {
    logger.error('Prisma error', { error: e });
});

// Log warnings
prisma.$on('warn', (e: any) => {
    logger.warn('Prisma warning', { warning: e });
});

// Handle pool errors
pool.on('error', (err) => {
    logger.error('Unexpected pool error', { error: err });
});

// Graceful shutdown
process.on('beforeExit', async () => {
    logger.info('Disconnecting Prisma client...');
    await prisma.$disconnect();
    await pool.end();
    logger.info('Prisma client disconnected');
});
