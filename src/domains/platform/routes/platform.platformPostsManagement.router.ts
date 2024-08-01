import express from 'express';
import { postSchema } from '../../posts/schemas/postSchema.zod.js';
import { ObjectId } from 'mongodb';
import * as z from 'zod';

// middlewares
import { validateData } from '../../../middlewares/validateDataMiddleware.js';
import authAndSessionsMiddleware from '../../../middlewares/authAndSessionMiddleware.js';
import verifyAdminMiddleware from '../../../middlewares/verifyAdminMiddleware.js';
import verifyUserDataToControllerMiddleware from '../../../middlewares/verifyUserDataToControllerMiddleware.js';

// end-point controllers
import deletePlatformPost from '../controllers/platformPostsManagement/platform.deletePost.controller.js';
import registerPost from '../controllers/platformPostsManagement/platform.registerPost.controller.js';
import updatePlatformPost from '../controllers/platformPostsManagement/platform.updatePost.controller.js';

// express router init
const router = express.Router();

// param type checking/validation
export const paramsSchema = z.object({
  postId: z
    .string()
    .min(1)
    .refine(
      (val) => {
        try {
          //   console.log(new ObjectId(val));
          return new ObjectId(val);
        } catch (error) {
          return false;
        }
      },
      {
        message: 'Invalid ObjectId: expected end-point param must be an exact mongoDB entry id'
      }
    )
});

// routes
router
  .route('/register-post')
  .post(authAndSessionsMiddleware, validateData({ body: postSchema }), verifyAdminMiddleware, verifyUserDataToControllerMiddleware, registerPost);
router
  .route('/update-post/:postId')
  .patch(
    authAndSessionsMiddleware,
    validateData({ body: postSchema, params: paramsSchema }),
    verifyAdminMiddleware,
    verifyUserDataToControllerMiddleware,
    updatePlatformPost
  );
router
  .route('/delete-post/:postId')
  .delete(
    authAndSessionsMiddleware,
    validateData({ body: postSchema, params: paramsSchema }),
    verifyAdminMiddleware,
    verifyUserDataToControllerMiddleware,
    deletePlatformPost
  );

export default router;
