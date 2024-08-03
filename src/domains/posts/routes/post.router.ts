import express from 'express';
// import { validateData } from '../../../middlewares/validateDataMiddleware.js';
import getPost from '../controllers/post.getPost.controller.js';
import getAllPost from '../controllers/post.getAllPost.controller.js';
import bookmarkPost from '../controllers/post.bookmarkPost.controller.js';
import reactToPost from '../controllers/post.removeReactionToPost.controller.js';
import getUserPostsBookmarks from '../controllers/post.getUserPostsBookmarks.controller.js';
import authAndSessionMiddleware from '../../../middlewares/authAndSessionMiddleware.js';

// import { ObjectId } from 'mongodb';
// import * as z from 'zod';

// express router init
const router = express.Router();

// export const paramsSchema = z.object({
//   activityId: z.string().length(4, { message: 'userId must be exactly 4 characters long' })
//   // .refine(
//   //   (val) => {
//   //     try {
//   //       // Assuming you still want to perform the ObjectId validation for some reason,
//   //       // even though it's unusual to have an ObjectId of length 4.
//   //       return new ObjectId(val);
//   //     } catch (error) {
//   //       return false;
//   //     }
//   //   },
//   //   {
//   //     message: 'Invalid ObjectId'
//   //   }
//   // )
// });

// routes
router.route('/get-post/:postSlug').get(authAndSessionMiddleware, getPost);
router.route('/get-all-posts').get(authAndSessionMiddleware, getAllPost);
router.route('/react-to-post/:postSlug').patch(authAndSessionMiddleware, reactToPost);
router.route('/bookmark-post/:postSlug').patch(authAndSessionMiddleware, bookmarkPost);
router.route('/get-user-bookmarks').get(authAndSessionMiddleware, getUserPostsBookmarks);

export default router;
