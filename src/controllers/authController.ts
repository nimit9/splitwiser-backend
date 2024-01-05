import BadRequestError from '../errors/bad-request';
import { StatusCodes } from 'http-status-codes';
import UnAuthenticatedError from '../errors/unauthenticated';
import User from '../models/User';
import { Request, Response } from 'express';
import { z } from 'zod';
import { LoginRequest } from '../interfaces/auth.interface';
import { generateOtp, sendEmailOtp, sendMobileOtp } from '../utils/otp-util';
import jwt from 'jsonwebtoken';

interface DecodedOTPToken {
    userId: string;
    otp: string;
}

const login = async (req: LoginRequest, res: Response) => {
    const { phone, email } = req.body;

    const loginType = req.loginType!;

    const otp = generateOtp();

    let user = await User.findOne({ [loginType]: req.body[loginType] });

    if (!user) {
        user = await User.create(req.body);
    }

    console.log('otp', otp);

    const otpToken = jwt.sign(
        { otp, userId: user._id },
        process.env.JWT_OTP_SECRET!,
        {
            expiresIn: process.env.JWT_OTP_LIFETIME!,
        },
    );
    console.log('otpToken', otpToken);

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
    });
};
const verifyOTP = async (req: Request, res: Response) => {
    const { otp } = req.body;

    if (!otp) {
        throw new BadRequestError('Please provide otp');
    }

    const { otpToken } = req.cookies;

    let decodedToken: DecodedOTPToken = {
        userId: '',
        otp: '',
    };

    try {
        decodedToken = jwt.verify(
            otpToken,
            process.env.JWT_OTP_SECRET!,
        ) as DecodedOTPToken;
    } catch (err: any) {
        res.clearCookie('otpToken');
        res.clearCookie('token');
        if (err.expiredAt) {
            throw new BadRequestError('OTP expired, please try again');
        }
    }

    const user = await User.findById(decodedToken.userId);

    if (!user) {
        throw new UnAuthenticatedError('Invalid user');
    }
    if (decodedToken.otp !== otp) {
        throw new UnAuthenticatedError('Invalid otp entered');
    }

    const token = user.createJWT();

    user.isVerified = true;
    await user.save();

    res.cookie('token', token, { httpOnly: true });
    res.clearCookie('otpToken');

    res.status(StatusCodes.OK).json({
        msg: 'OTP Verified Successfully',
        user,
        token,
    });
};

export { login, verifyOTP };
