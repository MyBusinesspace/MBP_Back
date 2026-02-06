import { Request, Response, NextFunction } from 'express';
import { getCompanyUsers, getCompanyById } from './db';
import { SearchUsersQuery } from './types';
import { NotFoundError } from '@/core/utils/errors';

const ensureString = (value: string | string[] | undefined): string => {
    if (Array.isArray(value)) return value[0];
    return value || '';
};

/**
 * GET /api/companies/:companyId/users/search
 * Search users in a company
 */
export const handleSearchCompanyUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const companyId = ensureString(req.params.companyId);
        const { search, limit } = req.query as SearchUsersQuery;

        const users = await getCompanyUsers(
            companyId,
            search,
            limit ? parseInt(limit.toString()) : undefined
        );

        res.json({
            success: true,
            data: users,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/companies/:companyId/users
 * Get all users in a company
 */
export const handleGetCompanyUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const companyId = ensureString(req.params.companyId);

        const users = await getCompanyUsers(companyId);

        res.json({
            success: true,
            data: users,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/companies/:companyId
 * Get company details
 */
export const handleGetCompany = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const companyId = ensureString(req.params.companyId);

        const company = await getCompanyById(companyId);

        if (!company) {
            throw new NotFoundError('Company not found');
        }

        res.json({
            success: true,
            data: company,
        });
    } catch (error) {
        next(error);
    }
};
