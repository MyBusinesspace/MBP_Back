import { prisma } from '@/core/database/prisma';
import { CreateWorkingOrderInput, UpdateWorkingOrderInput } from './types';

/**
 * Get all working orders for a project
 */
export const getProjectWorkingOrders = async (
  companyId: string,
  projectId: string
) => {
  return prisma.workingOrder.findMany({
    where: {
      companyId,
      projectId,
      isActive: true,
    },
    include: {
      _count: {
        select: {
          taskDetails: true,
          tasks: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Get a working order by ID
 */
export const getWorkingOrderById = async (workingOrderId: string) => {
  return prisma.workingOrder.findUnique({
    where: { id: workingOrderId },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      contact: {
        select: {
          id: true,
          contactName: true,
        },
      },
      _count: {
        select: {
          taskDetails: true,
          tasks: true,
        },
      },
    },
  });
};

/**
 * Create a working order
 */
export const createWorkingOrder = async (
  companyId: string,
  contactId: string,
  projectId: string,
  data: CreateWorkingOrderInput
) => {
  return prisma.workingOrder.create({
    data: {
      companyId,
      contactId,
      projectId,
      title: data.title,
    },
  });
};

/**
 * Update a working order
 */
export const updateWorkingOrder = async (
  workingOrderId: string,
  data: UpdateWorkingOrderInput
) => {
  return prisma.workingOrder.update({
    where: { id: workingOrderId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
};

/**
 * Delete (soft) a working order
 */
export const deleteWorkingOrder = async (workingOrderId: string) => {
  return prisma.workingOrder.update({
    where: { id: workingOrderId },
    data: { isActive: false },
  });
};

/**
 * Check if working order belongs to company
 */
export const workingOrderBelongsToCompany = async (
  workingOrderId: string,
  companyId: string
): Promise<boolean> => {
  const order = await prisma.workingOrder.findFirst({
    where: {
      id: workingOrderId,
      companyId,
    },
    select: { id: true },
  });

  return order !== null;
};