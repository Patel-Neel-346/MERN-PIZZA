import { Request } from 'express';

export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    id?: number;
    tenantId?: number;
}

export interface RegisterUserRequest extends Request {
    body: UserData;
}

export interface AuthRequest extends Request {
    auth: {
        sub: number;
        role: string;
        id?: number;
        firstName?: string;
        lastName?: string;
        email?: string;
    };
}

export interface IRefreshTokenPayload {
    id: string;
}

export interface ITenantData {
    name: string;
    address: string;
}

export interface RegisterTenantsrequest extends Request {
    body: ITenantData;
}

export interface PaginationParams {
    perPage: number;
    currentPage: number;
    q: string;
    role: string;
}

export interface CreateUserRequest extends Request {
    body: UserData;
}

export interface LimitedUserData {
    firstName: string;
    lastName: string;
    role: string;
    email?: string;
    tenantId?: number;
}

export interface UpdatedUserRequest extends Request {
    body: LimitedUserData;
}
