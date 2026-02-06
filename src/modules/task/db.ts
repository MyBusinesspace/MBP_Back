import { prisma } from '@/core/database/prisma';
import { CreateJobOrderInput } from './types';

/**
 * Create a complete job order (working order + task detail + task + assignments)
 * This handles the entire creation flow in a transaction
 */
export const createJobOrder = async (
  companyId: string,
  input: CreateJobOrderInput
) => {
  return prisma.$transaction(async (tx) => {
    // Step 1: Handle WorkingOrder
    let workingOrderId: string;

    if (input.workingOrder.isNew) {
      const newWorkingOrder = await tx.workingOrder.create({
        data: {
          companyId,
          contactId: input.case.customerId,
          projectId: input.case.id,
          title: input.workingOrder.title,
        },
      });
      workingOrderId = newWorkingOrder.id;
    } else {
      if (!input.workingOrder.id) {
        throw new Error('Working order ID is required when isNew is false');
      }
      workingOrderId = input.workingOrder.id;
    }

    // Step 2: Handle TaskDetail
    let taskDetailId: string;

    if (input.taskDetails.isNew) {
      // Look up category ID
      const category = await tx.taskCategory.findFirst({
        where: {
          companyId,
          name: input.taskDetails.category,
        },
      });

      const newTaskDetail = await tx.taskDetail.create({
        data: {
          companyId,
          contactId: input.case.customerId,
          projectId: input.case.id,
          workingOrderId,
          categoryId: category?.id || null,
          categoryName: input.taskDetails.category,
          title: input.taskDetails.title,
          instructions: input.taskDetails.instructions,
        },
      });
      taskDetailId = newTaskDetail.id;
    } else {
      if (!input.taskDetails.id) {
        throw new Error('Task detail ID is required when isNew is false');
      }
      taskDetailId = input.taskDetails.id;
    }

    // Get the task detail to snapshot its data
    const taskDetail = await tx.taskDetail.findUnique({
      where: { id: taskDetailId },
    });

    if (!taskDetail) {
      throw new Error('Task detail not found');
    }

    // Step 3: Create Task (always new)
    const instructionsCompleted = new Array(taskDetail.instructions.length).fill(false);

    const task = await tx.task.create({
      data: {
        companyId,
        contactId: input.case.customerId,
        projectId: input.case.id,
        workingOrderId,
        taskDetailId,
        categoryId: taskDetail.categoryId,
        categoryName: taskDetail.categoryName,
        taskDetailTitle: taskDetail.title,
        instructions: taskDetail.instructions,
        instructionsCompleted,
        scheduleEnabled: input.schedule.enabled,
        shiftType: input.schedule.enabled ? input.schedule.shiftType || null : null,
        scheduledDate: input.schedule.enabled && input.schedule.date
          ? new Date(input.schedule.date)
          : null,
        startTime: input.schedule.enabled ? input.schedule.startTime || null : null,
        endTime: input.schedule.enabled ? input.schedule.endTime || null : null,
        isRepeating: input.schedule.enabled && input.schedule.repeating.enabled,
        repeatFrequency:
          input.schedule.enabled && input.schedule.repeating.enabled
            ? input.schedule.repeating.frequency || null
            : null,
        repeatEndDate:
          input.schedule.enabled &&
          input.schedule.repeating.enabled &&
          input.schedule.repeating.endDate
            ? new Date(input.schedule.repeating.endDate)
            : null,
        status: 'open',
      },
    });

    // Step 4: Create TaskAssignments
    const uniqueUsers = new Map<string, {
      id: string;
      name: string | null;
      surname: string | null;
      email: string;
      assignmentType: 'team' | 'individual';
      teamId?: string;
      teamName?: string;
      teamCode?: string;
      teamColor?: string | null;
    }>();

    // Process team users first (higher priority)
    for (const user of input.assignedResources.teamUsers) {
      // Find which team this user belongs to
      const team = input.assignedResources.teams.find((t) =>
        input.assignedResources.teamUsers.some((tu) => tu.id === user.id)
      );

      uniqueUsers.set(user.id, {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        assignmentType: 'team',
        teamId: team?.id,
        teamName: team?.name,
        teamCode: team?.code,
        teamColor: team?.color,
      });
    }

    // Process individual users (only if not already added as team user)
    for (const user of input.assignedResources.individualUsers) {
      if (!uniqueUsers.has(user.id)) {
        uniqueUsers.set(user.id, {
          id: user.id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          assignmentType: 'individual',
        });
      }
    }

    // Create task assignments
    for (const user of uniqueUsers.values()) {
      await tx.taskAssignment.create({
        data: {
          taskId: task.id,
          userId: user.id,
          teamId: user.teamId || null,
          userName: user.name,
          userSurname: user.surname,
          userEmail: user.email,
          teamName: user.teamName || null,
          teamCode: user.teamCode || null,
          teamColor: user.teamColor || null,
          assignmentType: user.assignmentType,
        },
      });
    }

    return {
      taskId: task.id,
      workingOrderId,
      taskDetailId,
    };
  });
};

/**
 * Get all tasks for a company
 */
export const getCompanyTasks = async (companyId: string) => {
  return prisma.task.findMany({
    where: { companyId },
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
      workingOrder: {
        select: {
          id: true,
          title: true,
        },
      },
      taskDetail: {
        select: {
          id: true,
          title: true,
        },
      },
      assignments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              surname: true,
              email: true,
              avatar: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Get a task by ID
 */
export const getTaskById = async (taskId: string) => {
  return prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: true,
      contact: true,
      workingOrder: true,
      taskDetail: true,
      category: true,
      assignments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              surname: true,
              email: true,
              avatar: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
              code: true,
              color: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Update task status
 */
export const updateTaskStatus = async (taskId: string, status: string) => {
  return prisma.task.update({
    where: { id: taskId },
    data: { status },
  });
};

/**
 * Update instructions completed
 */
export const updateInstructionsCompleted = async (
  taskId: string,
  instructionsCompleted: boolean[]
) => {
  return prisma.task.update({
    where: { id: taskId },
    data: { instructionsCompleted },
  });
};