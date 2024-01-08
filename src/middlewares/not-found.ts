import { Request, Response } from 'express';
import { ApiResponse } from '../utils/ApiResponse';

const notFoundMiddleware = (req: Request, res: Response) => {
    res.status(400).send(new ApiResponse(400, {}, 'Route does not exist'));
};

export default notFoundMiddleware;
