import { Router } from 'express';
import { authenticateJWT } from '@/middleware/authenticate';
import { verifyCompanyAccess } from '@/middleware/verifyCompanyAccess';
import {
    handleCreateInvitation,
    handleGetCompanyInvitations,
    handleValidateInvitation,
    handleUseInvitation,
    handleDeleteInvitation,
} from './controller';

export const invitationRouter = Router();

// Public routes - validate invitation (no auth needed)
invitationRouter.get('/companies/invitations/:code/validate', handleValidateInvitation);

// Protected routes (require authentication)
invitationRouter.use(authenticateJWT);

// Use invitation (any authenticated user)
invitationRouter.post('/companies/invitations/:code/use', handleUseInvitation);

// Company-specific routes (require company access)
invitationRouter.post(
    '/companies/:companyId/invitations',
    verifyCompanyAccess,
    handleCreateInvitation
);

invitationRouter.get(
    '/companies/:companyId/invitations',
    verifyCompanyAccess,
    handleGetCompanyInvitations
);

invitationRouter.delete(
    '/companies/:companyId/invitations/:id',
    verifyCompanyAccess,
    handleDeleteInvitation
);
