import 'express-async-errors';

import authRouter from './routes/auth.router';
import profileRouter from './routes/profile.router';
import connectDB from '../src/db/connect';
import dotenv from 'dotenv';
import { errorHandlerMiddleware } from '../src/middlewares/error-handler';
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import notFoundMiddleware from '../src/middlewares/not-found';
import cors from 'cors';
dotenv.config();

const app = express();

app.use(
    cors({
        origin: ['http://localhost:1234'],
        credentials: true,
    }),
);

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}
app.use(cookieParser());
app.use(express.json());

// routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/profile', profileRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);
const port = process.env.PORT || 4000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI!);
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.log(error);
    }
};

start();
