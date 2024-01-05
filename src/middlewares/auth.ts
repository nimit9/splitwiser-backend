import { UnAuthenticatedError } from '../errors';
import { NextFunction, Request, Response } from 'express';

const auth = async (req: Request, res: Response, next: NextFunction) => {
    // const authHeader = req.headers.authorization;
    // if (!authHeader || !authHeader.startsWith('Bearer')) {
    //     throw new UnAuthenticatedError('Authentication Failed');
    // }
    // const token = authHeader.split(' ')[1];
    // try {
    //     const payload = jwt.verify(token, process.env.JWT_SECRET);
    //     req.user = { userId: payload.userId };
    //     next();
    // } catch (error) {
    //     throw new UnAuthenticatedError('Authentication Failed');
    // }
};

export default auth;
