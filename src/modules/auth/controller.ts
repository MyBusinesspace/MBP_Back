import { Request, Response, NextFunction } from 'express';
import { AuthUser } from './types';
import { jwtService } from '../../core/utils/jwt';
import { getUserCompanies, findUserById, findOrCreateUser } from './db';
import { UnauthorizedError } from '../../core/utils/errors';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_IOS_CLIENT_ID);

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

export const googleCallback = (req: Request, res: Response, next: NextFunction): void => {
    try {
        console.log('google callback called');
        // After Passport OAuth, req.user has 'id' (not 'userId')
        const user = req.user;

        if (!user?.id || !user?.email) {
            res.redirect(`${frontendUrl}/login?error=auth_failed`);
            return;
        }

        // Generate JWT
        const token = jwtService.generateToken({
            userId: user.id,
            email: user.email,
            name: user.name || user.email,
        });

        console.log(`${frontendUrl}/api/auth/callback?token=${token}`);
        // Redirect to frontend with token
        res.redirect(`${frontendUrl}/api/auth/callback?token=${token}`);
    } catch (error) {
        next(error);
    }
};

export const googleMobileLogin = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            throw new UnauthorizedError('No Google ID token provided');
        }

        // 1. Verify the token with Google
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_IOS_CLIENT_ID, // Use the iOS client ID here
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.sub || !payload.email) {
            throw new UnauthorizedError('Invalid Google token payload');
        }

        // 2. Map Google payload to your GoogleProfile type
        const googleProfile = {
            id: payload.sub,
            email: payload.email,
            name: payload.name || payload.email,
            picture: payload.picture,
        };

        // 3. Find or create user in your database (reusing your existing db logic)
        const user = await findOrCreateUser(googleProfile);

        // 4. Generate your App's standard JWT
        const token = jwtService.generateToken({
            userId: user.id,
            email: user.email,
            name: user.name || user.email,
        });

        // 5. Return success and the token (no redirect needed for mobile)
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatar: user.avatar
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getCurrentUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // After JWT middleware, req.user has 'userId'
        if (!req.user?.userId) {
            throw new UnauthorizedError('User not authenticated');
        }

        // Get full user details from database
        const user = await findUserById(req.user.userId);

        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        // Get user companies
        const companies = await getUserCompanies(user.id);

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                surname: user.surname,
                avatar: user.avatar,
            },
            companies: companies.map((cu) => cu.company),
        });
    } catch (error) {
        next(error);
    }
};

export const logout = (req: Request, res: Response, next: NextFunction): void => {
    try {
        res.json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const authFailure = (req: Request, res: Response): void => {
    res.status(401).json({
        success: false,
        message: 'Authentication failed',
    });
};
