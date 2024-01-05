import { login, logout, verifyOTP } from '../controllers/authController';

import express from 'express';
import { validateLoginFields } from '../middlewares/validateLoginFields';

const router = express.Router();

router.route('/login').post(validateLoginFields, login);
router.route('/verify-otp').post(verifyOTP);
router.route('/logout').get(logout);

export default router;
