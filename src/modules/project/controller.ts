import { Request, Response, NextFunction } from 'express';
import {
    createProject,
    getCompanyProjects,
    getProjectById,
    updateProject,
    deleteProject,
    contactBelongsToCompany,
} from './db';
import { BadRequestError, NotFoundError, ForbiddenError } from '@/utils/errors';

// Helper to ensure string
const ensureString = (value: string | string[] | undefined): string => {
    if (Array.isArray(value)) {
        return value[0];
    }
    return value || '';
};

export const handleCreateProject = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const companyId = ensureString(req.params.companyId);
        const { contactId, name, description, status } = req.body;

        if (!companyId) {
            throw new BadRequestError('Company ID is required');
        }

        // Validate required fields
        if (!contactId || !name || !status) {
            throw new BadRequestError('Missing required fields: contactId, name, status');
        }

        // Verify contact belongs to company
        const belongs = await contactBelongsToCompany(contactId, companyId);
        if (!belongs) {
            throw new ForbiddenError('Contact does not belong to this company');
        }

        const project = await createProject({
            companyId,
            contactId,
            name,
            description,
            status,
        });

        res.status(201).json({
            success: true,
            project: {
                id: project.id,
                company_id: project.companyId,
                contact_id: project.contactId,
                name: project.name,
                description: project.description,
                status: project.status,
                customer_name: project.contact.contactName,
                created_at: project.createdAt,
                updated_at: project.updatedAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const handleGetCompanyProjects = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const companyId = ensureString(req.params.companyId);

        if (!companyId) {
            throw new BadRequestError('Company ID is required');
        }

        const projects = await getCompanyProjects(companyId);

        res.json({
            success: true,
            projects: projects.map((project) => ({
                id: project.id,
                company_id: project.companyId,
                contact_id: project.contactId,
                name: project.name,
                description: project.description,
                status: project.status,
                customer_name: project.contact.contactName,
                created_at: project.createdAt,
                updated_at: project.updatedAt,
            })),
        });
    } catch (error) {
        next(error);
    }
};

export const handleGetProjectById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const projectId = ensureString(req.params.projectId);

        if (!projectId) {
            throw new BadRequestError('Project ID is required');
        }

        const project = await getProjectById(projectId);

        if (!project) {
            throw new NotFoundError('Project not found');
        }

        res.json({
            success: true,
            project: {
                id: project.id,
                company_id: project.companyId,
                contact_id: project.contactId,
                name: project.name,
                description: project.description,
                status: project.status,
                customer_name: project.contact.contactName,
                created_at: project.createdAt,
                updated_at: project.updatedAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const handleUpdateProject = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const projectId = ensureString(req.params.projectId);
        const { name, description, status, contactId } = req.body;

        if (!projectId) {
            throw new BadRequestError('Project ID is required');
        }

        // Check if project exists
        const existingProject = await getProjectById(projectId);
        if (!existingProject) {
            throw new NotFoundError('Project not found');
        }

        // If changing contact, verify it belongs to the same company
        if (contactId && contactId !== existingProject.contactId) {
            const belongs = await contactBelongsToCompany(contactId, existingProject.companyId);
            if (!belongs) {
                throw new ForbiddenError('Contact does not belong to this company');
            }
        }

        const project = await updateProject(projectId, {
            name,
            description,
            status,
            contactId,
        });

        res.json({
            success: true,
            project: {
                id: project.id,
                company_id: project.companyId,
                contact_id: project.contactId,
                name: project.name,
                description: project.description,
                status: project.status,
                customer_name: project.contact.contactName,
                created_at: project.createdAt,
                updated_at: project.updatedAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const handleDeleteProject = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const projectId = ensureString(req.params.projectId);

        if (!projectId) {
            throw new BadRequestError('Project ID is required');
        }

        const project = await getProjectById(projectId);
        if (!project) {
            throw new NotFoundError('Project not found');
        }

        await deleteProject(projectId);

        res.json({
            success: true,
            message: 'Project deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
