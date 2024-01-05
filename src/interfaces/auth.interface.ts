import { Request } from 'express';

export interface LoginFields {
    phone?: string;
    email?: string;
}

export interface LoginRequest extends Request {
    loginType?: 'phone' | 'email';
}
