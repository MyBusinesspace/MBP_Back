import { prisma } from '@/database/prisma';
import { CreateProjectInput, UpdateProjectInput } from './types';

export const createProject = async (data: CreateProjectInput) => {
    return await prisma.project.create({
        data: {
            companyId: data.companyId,
            contactId: data.contactId,
            name: data.name,
            description: data.description,
            status: data.status,
        },
        include: {
            contact: {
                select: {
                    contactName: true,
                },
            },
        },
    });
};

export const getCompanyProjects = async (companyId: string) => {
    return await prisma.project.findMany({
        where: { companyId },
        include: {
            contact: {
                select: {
                    id: true,
                    contactName: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

export const getProjectById = async (projectId: string) => {
    return await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            contact: {
                select: {
                    id: true,
                    contactName: true,
                },
            },
            company: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
};

export const updateProject = async (projectId: string, data: UpdateProjectInput) => {
    return await prisma.project.update({
        where: { id: projectId },
        data,
        include: {
            contact: {
                select: {
                    contactName: true,
                },
            },
        },
    });
};

export const deleteProject = async (projectId: string) => {
    return await prisma.project.delete({
        where: { id: projectId },
    });
};

export const contactBelongsToCompany = async (
    contactId: string,
    companyId: string
): Promise<boolean> => {
    const contact = await prisma.contact.findFirst({
        where: {
            id: contactId,
            companyId: companyId,
        },
    });
    return !!contact;
};
