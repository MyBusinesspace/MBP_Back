import { prisma } from '@/database/prisma';
import { CreateInvitationInput, UseInvitationInput } from './types';
import crypto from 'crypto';

export const generateInvitationCode = (): string => {
    return crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 characters
};

export const createInvitation = async (data: CreateInvitationInput, createdByUserId: string) => {
    const code = data.code || generateInvitationCode();

    return await prisma.invitation.create({
        data: {
            companyId: data.companyId,
            createdByUserId,
            code,
            maxUses: data.maxUses,
            expiresAt: data.expiresAt,
        },
        include: {
            company: {
                select: {
                    id: true,
                    name: true,
                },
            },
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
};

export const findInvitationByCode = async (code: string) => {
    return await prisma.invitation.findUnique({
        where: { code },
        include: {
            company: {
                select: {
                    id: true,
                    name: true,
                },
            },
            invitationUses: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });
};

export const getCompanyInvitations = async (companyId: string) => {
    return await prisma.invitation.findMany({
        where: { companyId },
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            invitationUses: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

export const useInvitation = async (data: UseInvitationInput) => {
    return await prisma.$transaction(async (tx) => {
        // Get invitation
        const invitation = await tx.invitation.findUnique({
            where: { code: data.code },
        });

        if (!invitation) {
            throw new Error('Invitation not found');
        }

        // Check if already member
        const existingMember = await tx.companyUser.findFirst({
            where: {
                userId: data.userId,
                companyId: invitation.companyId,
            },
        });

        if (existingMember) {
            throw new Error('User is already a member of this company');
        }

        // Add user to company
        await tx.companyUser.create({
            data: {
                userId: data.userId,
                companyId: invitation.companyId,
            },
        });

        // Record invitation use
        await tx.invitationUse.create({
            data: {
                invitationId: invitation.id,
                userId: data.userId,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
            },
        });

        // Update invitation usage count
        await tx.invitation.update({
            where: { id: invitation.id },
            data: {
                currentUses: {
                    increment: 1,
                },
            },
        });

        return invitation;
    });
};

export const deleteInvitation = async (invitationId: string) => {
    return await prisma.invitation.delete({
        where: { id: invitationId },
    });
};

export const deactivateInvitation = async (invitationId: string) => {
    return await prisma.invitation.update({
        where: { id: invitationId },
        data: { isActive: false },
    });
};
