import { Request } from 'express';
import { IUserDocument } from '../models/User';

export interface LoginFields {
    phone?: string;
    email?: string;
}

export interface LoginRequest extends Request {
    loginType?: 'phone' | 'email';
}
export interface AuthRequest extends Request {
    user?: IUserDocument;
}
