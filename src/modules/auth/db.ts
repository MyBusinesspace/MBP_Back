import { prisma } from '../../core/database/prisma';
import { GoogleProfile, AuthUser } from './types';

export const findUserByGoogleId = async (googleId: string): Promise<AuthUser | null> => {
    return await prisma.user.findUnique({
        where: { googleId },
        select: {
            id: true,
            email: true,
            name: true,
            surname: true,
            avatar: true,
            googleId: true,
        },
    });
};

export const findUserByEmail = async (email: string): Promise<AuthUser | null> => {
    return await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
            name: true,
            surname: true,
            avatar: true,
            googleId: true,
        },
    });
};

export const findUserById = async (id: string): Promise<AuthUser | null> => {
    return await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            name: true,
            surname: true,
            avatar: true,
            googleId: true,
        },
    });
};

export const createUser = async (profile: GoogleProfile): Promise<AuthUser> => {
    return await prisma.user.create({
        data: {
            email: profile.email,
            name: profile.name,
            avatar: profile.picture || null,
            googleId: profile.id,
        },
        select: {
            id: true,
            email: true,
            name: true,
            surname: true,
            avatar: true,
            googleId: true,
        },
    });
};

export const updateUserAvatar = async (googleId: string, avatar: string): Promise<AuthUser> => {
    return await prisma.user.update({
        where: { googleId },
        data: { avatar },
        select: {
            id: true,
            email: true,
            name: true,
            surname: true,
            avatar: true,
            googleId: true,
        },
    });
};

export const findOrCreateUser = async (profile: GoogleProfile): Promise<AuthUser> => {
    // Try to find existing user
    let user = await findUserByGoogleId(profile.id);

    if (user) {
        // Update avatar if it changed
        if (profile.picture && user.avatar !== profile.picture) {
            user = await updateUserAvatar(profile.id, profile.picture);
        }
        return user;
    }

    // Create new user
    return await createUser(profile);
};

export const getUserCompanies = async (userId: string) => {
    return await prisma.companyUser.findMany({
        where: { userId },
        include: {
            company: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    address: true,
                },
            },
        },
    });
};
