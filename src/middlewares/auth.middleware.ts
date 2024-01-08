import { UnAuthenticatedError } from '../errors';
import { NextFunction, Request, Response } from 'express';

import { BadRequestError } from '../errors';
import { z } from 'zod';
import {
    AuthRequest,
    LoginFields,
    LoginRequest,
} from '../interfaces/auth.interface';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/User';

export const verifyJWT = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const token =
        req.cookies?.accessToken ||
        req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        throw new UnAuthenticatedError('Unauthorised request');
    }

    const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET!,
    ) as JwtPayload;

    const user = await User.findById(decodedToken?.userId).select('-otp');
    if (!user) {
        throw new UnAuthenticatedError('Invalid Access Token');
    }

    (req as AuthRequest).user = user;
    next();
};

const validPhone = z.string().length(10).regex(/\d/);
export const validateLoginFields = async (
    req: LoginRequest,
    res: Response,
    next: NextFunction,
) => {
    const { phone, email }: LoginFields = req.body;

    //Throw Error if both phone and email are present
    if (phone && email) {
        throw new BadRequestError(
            'Please provide either one of phone or email address',
        );
    }
    // Throw error if  phone and email are not present
    if (!phone && !email) {
        throw new BadRequestError('Input is empty');
    }

    // Validate phone field
    if (phone) {
        if (!validPhone.safeParse(phone).success) {
            throw new BadRequestError('Invalid phone number');
        } else {
            req.loginType = 'phone';
            next();
        }
    }

    // validate email field
    if (email) {
        if (!z.string().email().safeParse(email).success) {
            throw new BadRequestError('Please provide a valid email address');
        } else {
            req.loginType = 'email';
            next();
        }
    }
};
