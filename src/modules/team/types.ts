// Input types
export interface CreateTeamInput {
    name: string;
    code: string;
    color?: string;
}

export interface UpdateTeamInput {
    name?: string;
    code?: string;
    color?: string;
}

export interface AddUserToTeamInput {
    userId: string;
}

// Output types
export interface TeamUser {
    id: string;
    email: string;
    name: string | null;
    surname: string | null;
    avatar: string | null;
}

export interface TeamWithUsers {
    id: string;
    companyId: string;
    name: string;
    code: string;
    color: string | null;
    createdAt: Date;
    updatedAt: Date;
    users: TeamUser[];
}

export interface Team {
    id: string;
    companyId: string;
    name: string;
    code: string;
    color: string | null;
    createdAt: Date;
    updatedAt: Date;
}
