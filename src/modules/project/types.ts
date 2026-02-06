export interface CreateProjectInput {
    companyId: string;
    contactId: string;
    name: string;
    description?: string | null;
    status: string;
}

export interface UpdateProjectInput {
    name?: string;
    description?: string | null;
    status?: string;
    contactId?: string;
}
