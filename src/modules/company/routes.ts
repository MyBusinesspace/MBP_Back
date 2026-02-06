import { Router } from 'express';
import { authenticateJWT } from '@/middleware/authenticate';
import { verifyCompanyAccess } from '@/middleware/verifyCompanyAccess';
import { handleGetCompany, handleGetCompanyUsers, handleSearchCompanyUsers } from './controller';

export const companyRouter = Router();

// All routes require authentication
companyRouter.use(authenticateJWT);

// Company routes
companyRouter.get('/companies/:companyId', verifyCompanyAccess, handleGetCompany);
companyRouter.get('/companies/:companyId/users', verifyCompanyAccess, handleGetCompanyUsers);
companyRouter.get(
    '/companies/:companyId/users/search',
    verifyCompanyAccess,
    handleSearchCompanyUsers
);
