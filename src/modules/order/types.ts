// Input types
export interface CreateWorkingOrderInput {
  title: string;
}

export interface UpdateWorkingOrderInput {
  title?: string;
  isActive?: boolean;
}

// Output types
export interface WorkingOrder {
  id: string;
  companyId: string;
  contactId: string;
  projectId: string;
  title: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkingOrderWithDetails extends WorkingOrder {
  taskDetailsCount: number;
  tasksCount: number;
}