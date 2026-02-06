import { Router } from 'express';
import { authenticateJWT } from '@/core/middleware/authenticate';
import { verifyCompanyAccess } from '@/core/middleware/verifyCompanyAccess';
import {
  handleGetProjectOrders,
  handleGetOrder,
  handleCreateOrder,
  handleUpdateOrder,
  handleDeleteOrder,
} from './controller';

const orderRouter = Router();

// All routes require authentication
orderRouter.use(authenticateJWT);

// Working order routes
orderRouter.get(
  '/:companyId/projects/:projectId/orders',
  verifyCompanyAccess,
  handleGetProjectOrders
);
orderRouter.get('/:companyId/orders/:orderId', verifyCompanyAccess, handleGetOrder);
orderRouter.post(
  '/:companyId/projects/:projectId/orders',
  verifyCompanyAccess,
  handleCreateOrder
);
orderRouter.patch('/:companyId/orders/:orderId', verifyCompanyAccess, handleUpdateOrder);
orderRouter.delete('/:companyId/orders/:orderId', verifyCompanyAccess, handleDeleteOrder);

export { orderRouter };