import otpGenerator from 'otp-generator';
import nodemailer from 'nodemailer';
import { BadRequestError } from '../errors';
const generateOtp = () => {
    return otpGenerator.generate(parseInt(process.env.OTP_LENGTH!), {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
    });
};

const sendMobileOtp = async (otp: string, contactNumber: string) => {
    const response = await fetch(`https://www.fast2sms.com/dev/bulkV2`, {
        method: 'POST',
        body: JSON.stringify({
            route: 'otp',
            variables_values: otp,
            numbers: contactNumber,
        }),
        headers: {
            'Content-Type': 'application/json',
            authorization: process.env.FAST2SM!,
        },
    });
    const data = await response.json();

    if (!data.return) {
        throw new BadRequestError('Unable to send otp');
    }

    return data;
};

const sendEmailOtp = async (emailOtp: string, email: string) => {
    const transport = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.BREVO_USERNAME!,
            pass: process.env.BREVO_PASSWORD!,
        },
    });

    const mailOptions = {
        from: 'nimitharia1@gmail.com',
        to: email,
        subject: 'Verify your email',
        html: `<b>${emailOtp}</b> is your OTP verification code <br> Do not share it with others`,
    };

    const mailResponse = await transport.sendMail(mailOptions);

    return mailResponse;
};

export { sendMobileOtp, generateOtp, sendEmailOtp };
