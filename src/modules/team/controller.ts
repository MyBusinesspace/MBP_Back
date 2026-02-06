import { Request, Response, NextFunction } from 'express';
import {
    getCompanyTeamsWithUsers,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam,
    addUserToTeam,
    removeUserFromTeam,
    getTeamMembers,
    teamBelongsToCompany,
} from './db';
import { CreateTeamInput, UpdateTeamInput, AddUserToTeamInput } from './types';
import { BadRequestError, NotFoundError, ForbiddenError } from '@/core/utils/errors';

const ensureString = (value: string | string[] | undefined): string => {
    if (Array.isArray(value)) return value[0];
    return value || '';
};

/**
 * GET /api/companies/:companyId/teams
 * Get all teams for a company with users
 */
export const handleGetCompanyTeams = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const companyId = ensureString(req.params.companyId);

        const teams = await getCompanyTeamsWithUsers(companyId);

        res.json({
            success: true,
            data: teams,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/companies/:companyId/teams/:teamId
 * Get a single team with members
 */
export const handleGetTeam = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const companyId = ensureString(req.params.companyId);
        const teamId = ensureString(req.params.teamId);

        // Verify team belongs to company
        const belongs = await teamBelongsToCompany(teamId, companyId);
        if (!belongs) {
            throw new NotFoundError('Team not found');
        }

        const team = await getTeamById(teamId);
        if (!team) {
            throw new NotFoundError('Team not found');
        }

        const members = await getTeamMembers(teamId);

        res.json({
            success: true,
            data: {
                ...team,
                users: members,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/companies/:companyId/teams
 * Create a new team
 */
export const handleCreateTeam = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const companyId = ensureString(req.params.companyId);
        const { name, code, color } = req.body as CreateTeamInput;

        if (!name || !code) {
            throw new BadRequestError('Name and code are required');
        }

        const team = await createTeam(companyId, { name, code, color });

        res.status(201).json({
            success: true,
            data: team,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/companies/:companyId/teams/:teamId
 * Update a team
 */
export const handleUpdateTeam = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const companyId = ensureString(req.params.companyId);
        const teamId = ensureString(req.params.teamId);
        const updates = req.body as UpdateTeamInput;

        // Verify team belongs to company
        const belongs = await teamBelongsToCompany(teamId, companyId);
        if (!belongs) {
            throw new NotFoundError('Team not found');
        }

        const team = await updateTeam(teamId, updates);

        res.json({
            success: true,
            data: team,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/companies/:companyId/teams/:teamId
 * Delete a team
 */
export const handleDeleteTeam = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const companyId = ensureString(req.params.companyId);
        const teamId = ensureString(req.params.teamId);

        // Verify team belongs to company
        const belongs = await teamBelongsToCompany(teamId, companyId);
        if (!belongs) {
            throw new NotFoundError('Team not found');
        }

        await deleteTeam(teamId);

        res.json({
            success: true,
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/companies/:companyId/teams/:teamId/users
 * Add user to team
 */
export const handleAddUserToTeam = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const companyId = ensureString(req.params.companyId);
        const teamId = ensureString(req.params.teamId);
        const { userId } = req.body as AddUserToTeamInput;

        if (!userId) {
            throw new BadRequestError('userId is required');
        }

        // Verify team belongs to company
        const belongs = await teamBelongsToCompany(teamId, companyId);
        if (!belongs) {
            throw new NotFoundError('Team not found');
        }

        await addUserToTeam(teamId, userId, companyId);

        res.status(201).json({
            success: true,
            data: null,
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes('not a member')) {
            next(new ForbiddenError('User is not a member of this company'));
        } else {
            next(error);
        }
    }
};

/**
 * DELETE /api/companies/:companyId/teams/:teamId/users/:userId
 * Remove user from team
 */
export const handleRemoveUserFromTeam = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const companyId = ensureString(req.params.companyId);
        const teamId = ensureString(req.params.teamId);
        const userId = ensureString(req.params.userId);

        // Verify team belongs to company
        const belongs = await teamBelongsToCompany(teamId, companyId);
        if (!belongs) {
            throw new NotFoundError('Team not found');
        }

        await removeUserFromTeam(teamId, userId, companyId);

        res.json({
            success: true,
            data: null,
        });
    } catch (error) {
        next(error);
    }
};
