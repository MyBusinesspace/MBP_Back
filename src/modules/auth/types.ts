export interface GoogleProfile {
    id: string;
    email: string;
    name: string;
    picture?: string;
}

export interface AuthUser {
    id: string;
    email: string;
    name: string | null;
    surname: string | null;
    avatar: string | null;
    googleId: string;
}
