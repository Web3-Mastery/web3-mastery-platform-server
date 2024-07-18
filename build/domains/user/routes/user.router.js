import express from 'express';
import { validateData } from '../../../middlewares/validateDataMiddleware.js';
import { ObjectId } from 'mongodb';
import * as z from 'zod';
import authAndSessionsMiddleware from '../../../middlewares/authAndSessionMiddleware.js';
import getUserProfileData from '../controllers/user.getUser.controller.js';
export const paramsSchema = z.object({
    userId: z
        .string()
        .min(1)
        .refine((val) => {
        try {
            //   console.log(new ObjectId(val));
            return new ObjectId(val);
        }
        catch (error) {
            return false;
        }
    }, {
        message: 'Invalid ObjectId'
    })
});
// express router init
const router = express.Router();
// routes
router.route('/get-user-profile/:userId').get(validateData({ params: paramsSchema }), authAndSessionsMiddleware, getUserProfileData);
export default router;
