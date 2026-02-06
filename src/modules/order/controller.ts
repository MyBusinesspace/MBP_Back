import { Request, Response, NextFunction } from 'express';
import {
  getProjectWorkingOrders,
  getWorkingOrderById,
  createWorkingOrder,
  updateWorkingOrder,
  deleteWorkingOrder,
  workingOrderBelongsToCompany,
} from './db';
import { CreateWorkingOrderInput, UpdateWorkingOrderInput } from './types';
import { BadRequestError, NotFoundError } from '@/core/utils/errors';

const ensureString = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) return value[0];
  return value || '';
};

/**
 * GET /api/companies/:companyId/projects/:projectId/orders
 * Get all working orders for a project
 */
export const handleGetProjectOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const companyId = ensureString(req.params.companyId);
    const projectId = ensureString(req.params.projectId);

    const orders = await getProjectWorkingOrders(companyId, projectId);

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/companies/:companyId/orders/:orderId
 * Get a single working order
 */
export const handleGetOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const companyId = ensureString(req.params.companyId);
    const orderId = ensureString(req.params.orderId);

    // Verify order belongs to company
    const belongs = await workingOrderBelongsToCompany(orderId, companyId);
    if (!belongs) {
      throw new NotFoundError('Working order not found');
    }

    const order = await getWorkingOrderById(orderId);
    if (!order) {
      throw new NotFoundError('Working order not found');
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/companies/:companyId/projects/:projectId/orders
 * Create a working order
 */
export const handleCreateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const companyId = ensureString(req.params.companyId);
    const projectId = ensureString(req.params.projectId);
    const { title, contactId } = req.body as CreateWorkingOrderInput & {
      contactId: string;
    };

    if (!title) {
      throw new BadRequestError('Title is required');
    }

    if (!contactId) {
      throw new BadRequestError('Contact ID is required');
    }

    const order = await createWorkingOrder(companyId, contactId, projectId, {
      title,
    });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/companies/:companyId/orders/:orderId
 * Update a working order
 */
export const handleUpdateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const companyId = ensureString(req.params.companyId);
    const orderId = ensureString(req.params.orderId);
    const updates = req.body as UpdateWorkingOrderInput;

    // Verify order belongs to company
    const belongs = await workingOrderBelongsToCompany(orderId, companyId);
    if (!belongs) {
      throw new NotFoundError('Working order not found');
    }

    const order = await updateWorkingOrder(orderId, updates);

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/companies/:companyId/orders/:orderId
 * Delete (soft) a working order
 */
export const handleDeleteOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const companyId = ensureString(req.params.companyId);
    const orderId = ensureString(req.params.orderId);

    // Verify order belongs to company
    const belongs = await workingOrderBelongsToCompany(orderId, companyId);
    if (!belongs) {
      throw new NotFoundError('Working order not found');
    }

    await deleteWorkingOrder(orderId);

    res.json({
      success: true,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};