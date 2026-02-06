import { prisma } from '@/database/prisma';
import { CreateContactInput, UpdateContactInput } from './types';

export const getCompanyContacts = async (companyId: string) => {
    return await prisma.contact.findMany({
        where: {
            companyId,
            isActiveContact: true,
        },
        include: {
            contactCompany: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: {
            contactName: 'asc',
        },
    });
};

export const searchContacts = async (companyId: string, searchTerm: string) => {
    return await prisma.contact.findMany({
        where: {
            companyId,
            isActiveContact: true,
            contactName: {
                contains: searchTerm,
                mode: 'insensitive',
            },
        },
        include: {
            contactCompany: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: {
            contactName: 'asc',
        },
    });
};

export const getContactById = async (contactId: string) => {
    return await prisma.contact.findUnique({
        where: { id: contactId },
        include: {
            contactCompany: {
                select: {
                    id: true,
                    name: true,
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

export const createContact = async (data: CreateContactInput) => {
    return await prisma.contact.create({
        data: {
            companyId: data.companyId,
            contactName: data.contactName,
            contactCompanyId: data.contactCompanyId,
            isActiveContact: data.isActiveContact ?? true,
        },
        include: {
            contactCompany: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
};

export const updateContact = async (contactId: string, data: UpdateContactInput) => {
    return await prisma.contact.update({
        where: { id: contactId },
        data,
        include: {
            contactCompany: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
};

export const deactivateContact = async (contactId: string) => {
    return await prisma.contact.update({
        where: { id: contactId },
        data: {
            isActiveContact: false,
        },
    });
};

export const deleteContact = async (contactId: string) => {
    return await prisma.contact.delete({
        where: { id: contactId },
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
