import { prisma } from '@/core/database/prisma';
import { CreateTeamInput, UpdateTeamInput, TeamWithUsers } from './types';

/**
 * Get all teams for a company with their users (optimized with single query)
 */
export const getCompanyTeamsWithUsers = async (companyId: string): Promise<TeamWithUsers[]> => {
    const teams = await prisma.team.findMany({
        where: { companyId },
        include: {
            teamUsers: {
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            surname: true,
                            avatar: true,
                        },
                    },
                },
                orderBy: [{ user: { name: 'asc' } }, { user: { email: 'asc' } }],
            },
        },
        orderBy: { name: 'asc' },
    });

    return teams.map((team) => ({
        id: team.id,
        companyId: team.companyId,
        name: team.name,
        code: team.code,
        color: team.color,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
        users: team.teamUsers.map((tu) => ({
            id: tu.user.id,
            email: tu.user.email,
            name: tu.user.name,
            surname: tu.user.surname,
            avatar: tu.user.avatar,
        })),
    }));
};

/**
 * Get a single team by ID
 */
export const getTeamById = async (teamId: string) => {
    return prisma.team.findUnique({
        where: { id: teamId },
    });
};

/**
 * Check if team belongs to company
 */
export const teamBelongsToCompany = async (teamId: string, companyId: string): Promise<boolean> => {
    const team = await prisma.team.findFirst({
        where: {
            id: teamId,
            companyId,
        },
        select: { id: true },
    });

    return team !== null;
};

/**
 * Create a new team
 */
export const createTeam = async (companyId: string, data: CreateTeamInput) => {
    return prisma.team.create({
        data: {
            companyId,
            name: data.name,
            code: data.code,
            color: data.color || null,
        },
    });
};

/**
 * Update a team
 */
export const updateTeam = async (teamId: string, data: UpdateTeamInput) => {
    return prisma.team.update({
        where: { id: teamId },
        data: {
            ...(data.name && { name: data.name }),
            ...(data.code && { code: data.code }),
            ...(data.color !== undefined && { color: data.color }),
        },
    });
};

/**
 * Delete a team
 */
export const deleteTeam = async (teamId: string) => {
    return prisma.team.delete({
        where: { id: teamId },
    });
};

/**
 * Add user to team
 */
export const addUserToTeam = async (teamId: string, userId: string, companyId: string) => {
    // First verify the user is a member of the company
    const companyUser = await prisma.companyUser.findFirst({
        where: {
            userId,
            companyId,
        },
    });

    if (!companyUser) {
        throw new Error('User is not a member of this company');
    }

    // Check if user is already in a team for this company (unique constraint)
    const existingTeamUser = await prisma.teamUser.findUnique({
        where: {
            team_users_one_team_per_company: {
                companyId,
                userId,
            },
        },
    });

    if (existingTeamUser) {
        // If already in this team, do nothing
        if (existingTeamUser.teamId === teamId) {
            return existingTeamUser;
        }
        // If in a different team, update to new team
        return prisma.teamUser.update({
            where: { id: existingTeamUser.id },
            data: { teamId },
        });
    }

    // Add user to team
    return prisma.teamUser.create({
        data: {
            companyId,
            teamId,
            userId,
        },
    });
};

/**
 * Remove user from team
 */
export const removeUserFromTeam = async (teamId: string, userId: string, companyId: string) => {
    return prisma.teamUser.deleteMany({
        where: {
            teamId,
            userId,
            companyId,
        },
    });
};

/**
 * Get team members
 */
export const getTeamMembers = async (teamId: string) => {
    const teamUsers = await prisma.teamUser.findMany({
        where: { teamId },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    surname: true,
                    avatar: true,
                },
            },
        },
        orderBy: [{ user: { name: 'asc' } }, { user: { email: 'asc' } }],
    });

    return teamUsers.map((tu) => tu.user);
};
