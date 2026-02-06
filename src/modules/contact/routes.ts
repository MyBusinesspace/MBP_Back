import { Router } from 'express';
import { authenticateJWT } from '@/middleware/authenticate';
import { verifyCompanyAccess } from '@/middleware/verifyCompanyAccess';
import {
    handleGetCompanyContacts,
    handleGetContactById,
    handleCreateContact,
    handleUpdateContact,
    handleDeactivateContact,
    handleDeleteContact,
} from './controller';

export const contactRouter = Router();

// All routes require authentication
contactRouter.use(authenticateJWT);

// Company contact routes (require company access)
contactRouter.get('/companies/:companyId/contacts', verifyCompanyAccess, handleGetCompanyContacts);

contactRouter.get(
    '/companies/:companyId/contacts/:contactId',
    verifyCompanyAccess,
    handleGetContactById
);

contactRouter.post('/companies/:companyId/contacts', verifyCompanyAccess, handleCreateContact);

contactRouter.put(
    '/companies/:companyId/contacts/:contactId',
    verifyCompanyAccess,
    handleUpdateContact
);

contactRouter.patch(
    '/companies/:companyId/contacts/:contactId/deactivate',
    verifyCompanyAccess,
    handleDeactivateContact
);

contactRouter.delete(
    '/companies/:companyId/contacts/:contactId',
    verifyCompanyAccess,
    handleDeleteContact
);
