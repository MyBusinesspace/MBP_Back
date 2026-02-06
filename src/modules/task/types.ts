// Input types for the create job order endpoint
export interface CreateJobOrderInput {
  case: {
    id: string; // projectId
    name: string;
    customerId: string; // contactId
    customerName: string;
  };
  workingOrder: {
    id: string | null;
    title: string;
    isNew: boolean;
  };
  taskDetails: {
    id: string | null;
    title: string;
    isNew: boolean;
    category: string;
    instructions: string[];
    instructionsCompleted: boolean[];
  };
  schedule: {
    enabled: boolean;
    shiftType?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    repeating: {
      enabled: boolean;
      frequency?: string;
      endDate?: string;
    };
  };
  assignedResources: {
    teams: Array<{
      id: string;
      name: string;
      code: string;
      color: string | null;
    }>;
    teamUsers: Array<{
      id: string;
      name: string | null;
      surname: string | null;
      email: string;
    }>;
    individualUsers: Array<{
      id: string;
      name: string | null;
      surname: string | null;
      email: string;
    }>;
  };
}

// Output types
export interface CreateJobOrderResponse {
  taskId: string;
  workingOrderId: string;
  taskDetailId: string;
}

export interface Task {
  id: string;
  companyId: string;
  contactId: string;
  projectId: string;
  workingOrderId: string;
  taskDetailId: string;
  categoryId: string | null;
  categoryName: string;
  taskDetailTitle: string;
  instructions: string[];
  instructionsCompleted: boolean[];
  scheduleEnabled: boolean;
  shiftType: string | null;
  scheduledDate: Date | null;
  startTime: string | null;
  endTime: string | null;
  isRepeating: boolean;
  repeatFrequency: string | null;
  repeatEndDate: Date | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}