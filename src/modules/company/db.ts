import { prisma } from '@/core/database/prisma';
import { CompanyUser } from './types';

/**
 * Get all users from a company
 */
export const getCompanyUsers = async (
    companyId: string,
    search?: string,
    limit: number = 50
): Promise<CompanyUser[]> => {
    const companyUsers = await prisma.companyUser.findMany({
        where: {
            companyId,
            ...(search && {
                user: {
                    OR: [
                        { email: { contains: search, mode: 'insensitive' } },
                        { name: { contains: search, mode: 'insensitive' } },
                        { surname: { contains: search, mode: 'insensitive' } },
                    ],
                },
            }),
        },
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
        take: limit,
    });

    return companyUsers.map((cu) => ({
        id: cu.user.id,
        email: cu.user.email,
        name: cu.user.name,
        surname: cu.user.surname,
        avatar: cu.user.avatar,
        createdAt: cu.createdAt,
    }));
};

/**
 * Get company details
 */
export const getCompanyById = async (companyId: string) => {
    return prisma.company.findUnique({
        where: { id: companyId },
    });
};

/**
 * Check if user belongs to company
 */
export const userBelongsToCompany = async (userId: string, companyId: string): Promise<boolean> => {
    const companyUser = await prisma.companyUser.findFirst({
        where: {
            userId,
            companyId,
        },
        select: { id: true },
    });

    return companyUser !== null;
};
