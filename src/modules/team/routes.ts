import { Router } from 'express';
import { verifyCompanyAccess } from '@/middleware/verifyCompanyAccess';
import { authenticateJWT } from '@/middleware/authenticate';
import {
    handleGetCompanyTeams,
    handleGetTeam,
    handleCreateTeam,
    handleUpdateTeam,
    handleDeleteTeam,
    handleAddUserToTeam,
    handleRemoveUserFromTeam,
} from './controller';

export const teamRouter = Router();

// All routes require authentication
teamRouter.use(authenticateJWT);

// Team CRUD - all routes have verifyCompanyAccess as second middleware
teamRouter.get('/companies/:companyId/teams', verifyCompanyAccess, handleGetCompanyTeams);
teamRouter.get('/companies/:companyId/teams/:teamId', verifyCompanyAccess, handleGetTeam);
teamRouter.post('/companies/:companyId/teams', verifyCompanyAccess, handleCreateTeam);
teamRouter.patch('/companies/:companyId/teams/:teamId', verifyCompanyAccess, handleUpdateTeam);
teamRouter.delete('/companies/:companyId/teams/:teamId', verifyCompanyAccess, handleDeleteTeam);

// Team members management
teamRouter.post(
    '/companies/:companyId/teams/:teamId/users',
    verifyCompanyAccess,
    handleAddUserToTeam
);
teamRouter.delete(
    '/companies/:companyId/teams/:teamId/users/:userId',
    verifyCompanyAccess,
    handleRemoveUserFromTeam
);
