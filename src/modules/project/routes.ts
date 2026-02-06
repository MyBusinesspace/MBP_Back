import { Router } from 'express';
import { authenticateJWT } from '@/middleware/authenticate';
import { verifyCompanyAccess } from '@/middleware/verifyCompanyAccess';
import {
    handleCreateProject,
    handleGetCompanyProjects,
    handleGetProjectById,
    handleUpdateProject,
    handleDeleteProject,
} from './controller';

export const projectRouter = Router();

// All routes require authentication
projectRouter.use(authenticateJWT);

// Company project routes (require company access)
projectRouter.post('/companies/:companyId/projects', verifyCompanyAccess, handleCreateProject);

projectRouter.get('/companies/:companyId/projects', verifyCompanyAccess, handleGetCompanyProjects);

projectRouter.get(
    '/companies/:companyId/projects/:projectId',
    verifyCompanyAccess,
    handleGetProjectById
);

projectRouter.put(
    '/companies/:companyId/projects/:projectId',
    verifyCompanyAccess,
    handleUpdateProject
);

projectRouter.delete(
    '/companies/:companyId/projects/:projectId',
    verifyCompanyAccess,
    handleDeleteProject
);
