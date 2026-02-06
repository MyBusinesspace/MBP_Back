export interface CreateInvitationInput {
    companyId: string;
    code?: string;
    maxUses?: number | null;
    expiresAt?: Date | null;
}

export interface UseInvitationInput {
    code: string;
    userId: string;
    ipAddress?: string;
    userAgent?: string;
}
