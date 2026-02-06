// This file extends Express types globally
declare global {
    namespace Express {
        // Flexible user type that works for both JWT and Passport
        interface User {
            // From JWTPayload (after JWT authentication)
            userId?: string;
            email?: string;
            name?: string | null;

            // From AuthUser (after Passport authentication)
            id?: string;
            surname?: string | null;
            avatar?: string | null;
            googleId?: string;

            // Allow any additional properties
            [key: string]: any;
        }

        interface Request {
            user?: User;
        }
    }
}

// This export is required to make TypeScript treat this as a module
export {};
