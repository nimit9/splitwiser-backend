import {
    login,
    logout,
    verifyOTP,
    getCurrentUser,
} from '../controllers/auth.controller';

import express from 'express';
import { validateLoginFields, verifyJWT } from '../middlewares/auth.middleware';

const router = express.Router();

router.route('/login').post(validateLoginFields, login);
router.route('/verify-otp').post(verifyOTP);
router.route('/logout').get(logout);
router.route('/me').get(verifyJWT, getCurrentUser);

export default router;
