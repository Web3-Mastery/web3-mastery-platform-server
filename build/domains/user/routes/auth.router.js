import express from 'express';
import { validateData } from '../../../middlewares/validateDataMiddleware.js';
import { userSchema } from '../schemas/userSchema.zod.js';
import startUserSignUp from '../controllers/auth.startUserSignUp.controller.js';
import verifySignUpInitialization from '../controllers/auth.verifySignUpInitialization.controller.js';
import preSignUpAuthAndSessionMiddleware from '../../../middlewares/preSignUpAuthAndSessionMiddleware.js';
import completeSignUp from '../controllers/auth.completeSignUp.controller.js';
import { z } from 'zod';
import loginUser from '../controllers/auth.login.controller.js';
import openAccessSessionsMiddleware from '../../../middlewares/openAccessSessionsMiddleware.js';
// express router init
const router = express.Router();
// routes
const preSignUpSchema = z.object({
    preSignUpToken: z
        .string({
        // required_error: 'Name is required',
        invalid_type_error: 'preSignUpSchema must be a string'
    })
        .optional()
});
router.route('/start-sign-up').post(validateData({ body: userSchema }), openAccessSessionsMiddleware, startUserSignUp);
router
    .route('/verify-sign-up-initialization')
    .post(validateData({ body: preSignUpSchema }), preSignUpAuthAndSessionMiddleware, verifySignUpInitialization);
router.route('/complete-sign-up').post(validateData({ body: userSchema }), preSignUpAuthAndSessionMiddleware, completeSignUp);
router.route('/log-in').post(validateData({ body: userSchema }), openAccessSessionsMiddleware, loginUser);
export default router;
