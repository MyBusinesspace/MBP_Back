export interface CreateContactInput {
    companyId: string;
    contactName: string;
    contactCompanyId?: string | null;
    isActiveContact?: boolean;
}

export interface UpdateContactInput {
    contactName?: string;
    contactCompanyId?: string | null;
    isActiveContact?: boolean;
}
