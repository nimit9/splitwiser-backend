import { NextFunction, Request, Response, ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Error as MongooseError } from 'mongoose';

import { MongoError } from 'mongodb';
interface DefaultError {
    statusCode: number;
    msg: string;
}

type CustomError = {
    statusCode: number;
    message: string;
};
type MongoDuplicateError = {
    keyValue: string;
};
export const errorHandlerMiddleware = (
    err: Error | MongooseError | CustomError | MongoDuplicateError,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const defaultError: DefaultError = {
        statusCode:
            (err as CustomError).statusCode ||
            StatusCodes.INTERNAL_SERVER_ERROR,
        msg:
            (err as CustomError).message ||
            'Something went wrong, try again later',
    };
    if (err instanceof MongooseError.ValidationError) {
        defaultError.statusCode = StatusCodes.BAD_REQUEST;
        defaultError.msg = Object.values(err.errors)
            .map((item) => item.message)
            .join(',');
    }
    if ((err as MongoError).code && (err as MongoError).code === 11000) {
        defaultError.statusCode = StatusCodes.BAD_REQUEST;
        defaultError.msg = `${Object.keys(
            (err as MongoDuplicateError).keyValue,
        )} has to be unique`;
    }
    // res.status(500).json({"msg":err})
    res.status(defaultError.statusCode).json({
        msg: defaultError.msg,
        success: false,
    });
};
