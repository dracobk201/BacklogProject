export interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
    username: string;
}

export const UserRole = {
    Admin: 'admin',
    User: 'user',
    External: 'external'
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface LoginResponse {
    access_token: string;
    // refresh_token?: string;
    // expires_in?: number;
    // token_type?: string;
    user: AuthUser;
    // mfa_required?: boolean;
}
