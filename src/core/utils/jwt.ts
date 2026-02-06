import jwt from 'jsonwebtoken';
import { UnauthorizedError } from './errors';
import { logger } from './logger';

export interface JWTPayload {
    userId: string;
    email: string;
    name: string;
}

export class JWTService {
    private secret: string;
    private expiresIn: string;

    constructor() {
        this.secret = process.env.JWT_SECRET || '';
        this.expiresIn = process.env.JWT_EXPIRES_IN || '7d';

        if (!this.secret) {
            throw new Error('JWT_SECRET environment variable is required');
        }
    }

    generateToken(payload: JWTPayload): string {
        return jwt.sign(payload, this.secret, {
            expiresIn: this.expiresIn,
        } as jwt.SignOptions);
    }

    verifyToken(token: string): JWTPayload {
        try {
            logger.debug('Verifying token with secret:', this.secret.substring(0, 10) + '...');
            const decoded = jwt.verify(token, this.secret) as JWTPayload;
            logger.debug('Token decoded successfully:', decoded);
            return decoded;
        } catch (error: any) {
            logger.error('Token verification failed:', {
                error: error.message,
                name: error.name,
            });
            throw new UnauthorizedError(`Invalid or expired token: ${error.message}`);
        }
    }
}

export const jwtService = new JWTService();
