import { Request } from 'express';

export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
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
