import { Request, Response } from 'express';
import { prisma } from '../../database/prisma';

export const healthCheck = async (req: Request, res: Response): Promise<void> => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: 'unknown',
    };

    try {
        await prisma.$queryRaw`SELECT 1`;
        health.database = 'connected';
    } catch (error) {
        health.status = 'error';
        health.database = 'disconnected';
    }

    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
};
