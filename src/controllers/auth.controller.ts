import BadRequestError from '../errors/bad-request';
import { StatusCodes } from 'http-status-codes';
import UnAuthenticatedError from '../errors/unauthenticated';
import User from '../models/User';
import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthRequest, LoginRequest } from '../interfaces/auth.interface';
import { generateOtp, sendEmailOtp, sendMobileOtp } from '../utils/otp-util';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../utils/ApiResponse';

interface IDecodedToken {
    userId: string;
}

const login = async (req: LoginRequest, res: Response) => {
    console.log('szvss');

    const loginType = req.loginType!;

    const otp = generateOtp();

    console.log('otp', otp);

    let user = await User.findOne({ [loginType]: req.body[loginType] });

    if (!user) {
        user = await User.create({ ...req.body, otp });
    } else {
        user.otp = otp;
        await user.save();
    }

    const otpToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_OTP_SECRET!,
        {
            expiresIn: process.env.JWT_OTP_LIFETIME!,
        },
    );

    switch (req.loginType) {
        case 'email':
            // await sendEmailOtp(otp, email);
            break;
        case 'phone':
            // await sendMobileOtp(otp, phone);
            break;
        default:
            throw new BadRequestError('Something went wrong');
    }

    res.cookie('otpToken', otpToken, {
        httpOnly: true,
    });

    return res.status(StatusCodes.OK).json({
        message: `OTP sent to your ${req.loginType}`,
        otpToken,
        success: true,
    });
};
const verifyOTP = async (req: Request, res: Response) => {
    const { otp } = req.body;

    if (!otp) {
        throw new BadRequestError('Please provide otp');
    }

    const { otpToken } = req.cookies;

    if (!otpToken) {
        throw new BadRequestError('OTP expired, please try again');
    }

    let decodedToken: IDecodedToken = { userId: '' };

    try {
        decodedToken = jwt.verify(
            otpToken,
            process.env.JWT_OTP_SECRET!,
        ) as IDecodedToken;
    } catch (err: any) {
        res.clearCookie('otpToken');
        res.clearCookie('accessToken');
        if (err.expiredAt) {
            throw new BadRequestError('OTP expired, please try again');
        }
    }

    const user = await User.findById(decodedToken.userId);

    if (!user) {
        throw new BadRequestError('Invalid user');
    }
    if (user.otp !== otp) {
        throw new BadRequestError('Invalid otp entered');
    }

    const accessToken = user.createJWT();

    user.isVerified = true;
    user.otp = '';
    await user.save();

    res.cookie('accessToken', accessToken, { httpOnly: true });
    res.clearCookie('otpToken');

    res.status(StatusCodes.OK).json({
        msg: 'OTP Verified Successfully',
        user,
        accessToken: accessToken,
        success: true,
    });
};

const logout = (req: Request, res: Response) => {
    res.clearCookie('otpToken');
    res.clearCookie('accessToken');

    res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, { success: true }, 'Logout Successful'),
    );
};

const getCurrentUser = async (req: AuthRequest, res: Response) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { user: req.user! },
                'User fetched successfully',
            ),
        );
};

export { login, verifyOTP, logout, getCurrentUser };
