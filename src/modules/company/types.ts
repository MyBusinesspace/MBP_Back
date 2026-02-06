// Output types
export interface CompanyUser {
    id: string;
    email: string;
    name: string | null;
    surname: string | null;
    avatar: string | null;
    createdAt: Date;
}

export interface CompanyDetails {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    createdAt: Date;
    updatedAt: Date;
}

// Query params
export interface SearchUsersQuery {
    search?: string;
    limit?: number;
}
