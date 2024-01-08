import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import { addName } from '../controllers/profile.controller';

const router = express.Router();

router.route('/add-name').post(verifyJWT, addName);

export default router;
