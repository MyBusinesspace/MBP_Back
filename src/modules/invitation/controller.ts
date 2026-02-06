import { Request, Response, NextFunction } from 'express';
import {
    createInvitation,
    getCompanyInvitations,
    findInvitationByCode,
    useInvitation,
    deleteInvitation as deleteInvitationDb,
} from './db';
import { BadRequestError, NotFoundError, ConflictError } from '@/utils/errors';

// Helper to ensure string
const ensureString = (value: string | string[] | undefined): string => {
    if (Array.isArray(value)) {
        return value[0];
    }
    return value || '';
};

export const handleCreateInvitation = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const companyId = ensureString(req.params.companyId);
        const { maxUses, expiresAt } = req.body;

        if (!req.user?.userId) {
            throw new BadRequestError('User not authenticated');
        }

        if (!companyId) {
            throw new BadRequestError('Company ID is required');
        }

        const invitation = await createInvitation(
            {
                companyId,
                maxUses: maxUses || null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            },
            req.user.userId
        );

        res.status(201).json({
            success: true,
            invitation: {
                id: invitation.id,
                code: invitation.code,
                max_uses: invitation.maxUses,
                current_uses: invitation.currentUses,
                expires_at: invitation.expiresAt,
                is_active: invitation.isActive,
                created_at: invitation.createdAt,
                creator_name: invitation.createdBy.name,
                creator_email: invitation.createdBy.email,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const handleGetCompanyInvitations = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const companyId = ensureString(req.params.companyId);

        if (!companyId) {
            throw new BadRequestError('Company ID is required');
        }

        const invitations = await getCompanyInvitations(companyId);

        res.json({
            success: true,
            invitations: invitations.map((inv) => ({
                id: inv.id,
                code: inv.code,
                max_uses: inv.maxUses,
                current_uses: inv.currentUses,
                expires_at: inv.expiresAt,
                is_active: inv.isActive,
                created_at: inv.createdAt,
                creator_name: inv.createdBy.name,
                creator_email: inv.createdBy.email,
            })),
        });
    } catch (error) {
        next(error);
    }
};

export const handleValidateInvitation = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const code = ensureString(req.params.code);

        if (!code) {
            throw new BadRequestError('Invitation code is required');
        }

        const invitation = await findInvitationByCode(code);

        if (!invitation) {
            throw new NotFoundError('Invitation not found');
        }

        // Check if invitation is valid
        if (!invitation.isActive) {
            throw new BadRequestError('Invitation is no longer active');
        }

        if (invitation.expiresAt && new Date() > invitation.expiresAt) {
            throw new BadRequestError('Invitation has expired');
        }

        if (invitation.maxUses !== null && invitation.currentUses >= invitation.maxUses) {
            throw new BadRequestError('Invitation has reached maximum uses');
        }

        // Return info for frontend
        res.json({
            success: true,
            invitation: {
                id: invitation.id,
                code: invitation.code,
                company_name: invitation.company.name,
                company_id: invitation.company.id,
                max_uses: invitation.maxUses,
                current_uses: invitation.currentUses,
                expires_at: invitation.expiresAt,
                is_active: invitation.isActive,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const handleUseInvitation = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const code = ensureString(req.params.code);

        if (!req.user?.userId) {
            throw new BadRequestError('User not authenticated');
        }

        if (!code) {
            throw new BadRequestError('Invitation code is required');
        }

        const invitation = await findInvitationByCode(code);

        if (!invitation) {
            throw new NotFoundError('Invitation not found');
        }

        // Validate invitation
        if (!invitation.isActive) {
            throw new BadRequestError('Invitation is no longer active');
        }

        if (invitation.expiresAt && new Date() > invitation.expiresAt) {
            throw new BadRequestError('Invitation has expired');
        }

        if (invitation.maxUses !== null && invitation.currentUses >= invitation.maxUses) {
            throw new BadRequestError('Invitation has reached maximum uses');
        }

        await useInvitation({
            code,
            userId: req.user.userId,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            success: true,
            message: 'Successfully joined company',
            company: {
                id: invitation.company.id,
                name: invitation.company.name,
            },
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes('already a member')) {
            next(new ConflictError('You are already a member of this company'));
        } else {
            next(error);
        }
    }
};

export const handleDeleteInvitation = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = ensureString(req.params.id);

        if (!id) {
            throw new BadRequestError('Invitation ID is required');
        }

        await deleteInvitationDb(id);

        res.json({
            success: true,
            message: 'Invitation deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
