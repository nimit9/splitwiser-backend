import jwt from 'jsonwebtoken';
import mongoose, { Document } from 'mongoose';

export interface IUser {
    name?: string;
    phone?: string;
    email?: string;
    isVerified?: boolean;
    otp?: string;
}

interface IUserDocument extends IUser, Document {
    createJWT: () => void;
}

const UserSchema = new mongoose.Schema<IUser>(
    {
        name: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
            unique: true,
        },
        email: {
            type: String,
            unique: true,
            validate: {
                validator: function (value: string) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                },
                message: 'Invalid email address format',
            },
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        otp: String,
    },
    { timestamps: true },
);

UserSchema.methods.createJWT = function () {
    return jwt.sign({ userId: this._id }, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_LIFETIME,
    });
};

export default mongoose.model<IUserDocument>('User', UserSchema);
