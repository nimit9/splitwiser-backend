import { Response } from 'express';
import { AuthRequest } from '../interfaces/auth.interface';
import { ApiResponse } from '../utils/ApiResponse';
import { BadRequestError } from '../errors';

const addName = async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    if (user.name) {
        throw new BadRequestError('Name already present');
    }
    const { name } = req.body;

    if (!name || name.length < 2) {
        throw new BadRequestError('Please provide correct name');
    }
    user.name = name;

    await user.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { user: req.user! },
                'Username added successfully',
            ),
        );
};

export { addName };
