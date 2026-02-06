import { Router } from 'express';
import { authenticateJWT } from '@/core/middleware/authenticate';
import { verifyCompanyAccess } from '@/core/middleware/verifyCompanyAccess';
import {
  handleCreateJobOrder,
  handleGetTasks,
  handleGetTask,
  handleUpdateTaskStatus,
  handleUpdateInstructions,
} from './controller';

const taskRouter = Router();

// All routes require authentication
taskRouter.use(authenticateJWT);

// Job order / Task routes
taskRouter.post('/:companyId/job-orders', verifyCompanyAccess, handleCreateJobOrder);
taskRouter.get('/:companyId/tasks', verifyCompanyAccess, handleGetTasks);
taskRouter.get('/:companyId/tasks/:taskId', verifyCompanyAccess, handleGetTask);
taskRouter.patch(
  '/:companyId/tasks/:taskId/status',
  verifyCompanyAccess,
  handleUpdateTaskStatus
);
taskRouter.patch(
  '/:companyId/tasks/:taskId/instructions',
  verifyCompanyAccess,
  handleUpdateInstructions
);

export { taskRouter };