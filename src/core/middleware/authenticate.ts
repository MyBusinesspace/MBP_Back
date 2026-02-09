import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';
import { logger } from '../utils/logger';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // ✅ إضافة استثناء لمسارات تسجيل الدخول بجوجل
        // هذا يسمح للطلب بالمرور إذا كان الرابط يحتوي على auth/google
        if (req.path.includes('/auth/google')) {
            return next();
        }

        const authHeader = req.headers.authorization;

        logger.debug('Auth header received:', authHeader);

        if (!authHeader) {
            throw new UnauthorizedError('No authorization header provided');
        }

        const parts = authHeader.split(' ');

        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            throw new UnauthorizedError('Invalid authorization header format');
        }

        const token = parts[1];
        logger.debug('Token extracted:', token.substring(0, 20) + '...');

        const payload = jwtService.verifyToken(token);
        logger.debug('Token verified successfully:', payload);

        // Attach user to request
        req.user = payload;

        next();
    } catch (error) {
        logger.error('Authentication failed:', error);
        next(error);
    }
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader) {
            const parts = authHeader.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                const token = parts[1];
                const payload = jwtService.verifyToken(token);
                req.user = payload;
            }
        }

        next();
    } catch (error) {
        next();
    }
};