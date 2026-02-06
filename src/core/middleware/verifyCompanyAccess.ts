import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/database/prisma';
import { ForbiddenError, BadRequestError } from '@/utils/errors';

/**
 * Middleware to verify user belongs to the company
 * Must be used after authenticateJWT
 */
export const verifyCompanyAccess = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Get companyId from params, body, or query
        let companyId = req.params.companyId || req.body.companyId || req.query.companyId;

        if (!req.user?.userId) {
            throw new ForbiddenError('User not authenticated');
        }

        if (!companyId) {
            throw new BadRequestError('Company ID is required');
        }

        // Convert to string if array
        if (Array.isArray(companyId)) {
            companyId = companyId[0];
        }

        // Check if user belongs to the company
        const companyUser = await prisma.companyUser.findFirst({
            where: {
                userId: req.user.userId,
                companyId: companyId as string,
            },
        });

        if (!companyUser) {
            throw new ForbiddenError('You do not have access to this company');
        }

        // Attach companyId to request for later use
        (req as any).companyId = companyId as string;

        next();
    } catch (error) {
        next(error);
    }
};
