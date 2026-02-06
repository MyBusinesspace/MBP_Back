import { Request, Response, NextFunction } from 'express';
import {
    getCompanyContacts,
    searchContacts,
    getContactById,
    createContact,
    updateContact,
    deactivateContact,
    deleteContact,
} from './db';
import { BadRequestError, NotFoundError } from '@/utils/errors';

// Helper to ensure string
const ensureString = (value: string | string[] | undefined): string => {
    if (Array.isArray(value)) {
        return value[0];
    }
    return value || '';
};

export const handleGetCompanyContacts = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const companyId = ensureString(req.params.companyId);
        const search = req.query.search as string | undefined;

        if (!companyId) {
            throw new BadRequestError('Company ID is required');
        }

        let contacts;
        if (search && typeof search === 'string') {
            contacts = await searchContacts(companyId, search);
        } else {
            contacts = await getCompanyContacts(companyId);
        }

        res.json({
            success: true,
            contacts: contacts.map((contact) => ({
                id: contact.id,
                company_id: contact.companyId,
                contact_company_id: contact.contactCompanyId,
                contact_name: contact.contactName,
                contact_company_name: contact.contactCompany?.name,
                is_active_contact: contact.isActiveContact,
                created_at: contact.createdAt,
                updated_at: contact.updatedAt,
            })),
        });
    } catch (error) {
        next(error);
    }
};

export const handleGetContactById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const contactId = ensureString(req.params.contactId);

        if (!contactId) {
            throw new BadRequestError('Contact ID is required');
        }

        const contact = await getContactById(contactId);

        if (!contact) {
            throw new NotFoundError('Contact not found');
        }

        res.json({
            success: true,
            contact: {
                id: contact.id,
                company_id: contact.companyId,
                contact_company_id: contact.contactCompanyId,
                contact_name: contact.contactName,
                contact_company_name: contact.contactCompany?.name,
                is_active_contact: contact.isActiveContact,
                created_at: contact.createdAt,
                updated_at: contact.updatedAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const handleCreateContact = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const companyId = ensureString(req.params.companyId);
        const { contactName, contactCompanyId, isActiveContact } = req.body;

        if (!companyId) {
            throw new BadRequestError('Company ID is required');
        }

        if (!contactName) {
            throw new BadRequestError('Contact name is required');
        }

        const contact = await createContact({
            companyId,
            contactName,
            contactCompanyId,
            isActiveContact,
        });

        res.status(201).json({
            success: true,
            contact: {
                id: contact.id,
                company_id: contact.companyId,
                contact_company_id: contact.contactCompanyId,
                contact_name: contact.contactName,
                contact_company_name: contact.contactCompany?.name,
                is_active_contact: contact.isActiveContact,
                created_at: contact.createdAt,
                updated_at: contact.updatedAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const handleUpdateContact = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const contactId = ensureString(req.params.contactId);
        const { contactName, contactCompanyId, isActiveContact } = req.body;

        if (!contactId) {
            throw new BadRequestError('Contact ID is required');
        }

        const existingContact = await getContactById(contactId);
        if (!existingContact) {
            throw new NotFoundError('Contact not found');
        }

        const contact = await updateContact(contactId, {
            contactName,
            contactCompanyId,
            isActiveContact,
        });

        res.json({
            success: true,
            contact: {
                id: contact.id,
                company_id: contact.companyId,
                contact_company_id: contact.contactCompanyId,
                contact_name: contact.contactName,
                contact_company_name: contact.contactCompany?.name,
                is_active_contact: contact.isActiveContact,
                created_at: contact.createdAt,
                updated_at: contact.updatedAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const handleDeactivateContact = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const contactId = ensureString(req.params.contactId);

        if (!contactId) {
            throw new BadRequestError('Contact ID is required');
        }

        const contact = await getContactById(contactId);
        if (!contact) {
            throw new NotFoundError('Contact not found');
        }

        await deactivateContact(contactId);

        res.json({
            success: true,
            message: 'Contact deactivated successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const handleDeleteContact = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const contactId = ensureString(req.params.contactId);

        if (!contactId) {
            throw new BadRequestError('Contact ID is required');
        }

        const contact = await getContactById(contactId);
        if (!contact) {
            throw new NotFoundError('Contact not found');
        }

        await deleteContact(contactId);

        res.json({
            success: true,
            message: 'Contact deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
