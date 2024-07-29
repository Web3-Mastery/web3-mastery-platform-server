import express from 'express';
import { validateData } from '../../../middlewares/validateDataMiddleware.js';
import createSessionActivityController from '../controllers/platform.createSessionActivity.controller.js';
import updateSessionActivityController from '../controllers/platform.updateSessionActivity.controller.js';
import deletePlatformSessionActivity from '../controllers/platform.deleteSessionActivity.controller.js';
import getAllPlatformSessionActivities from '../controllers/platform.getAllSessionActivities.controller.js';
import getSessionActivity from '../controllers/platform.getSessionActivity.controller.js';
import { sessionActivitySchema } from '../schemas/sessionActivity.schema.js';
// import verifyAdminMiddleware from '../../../middlewares/verifyAdminMiddleware.js';
import deletePlatformPost from '../controllers/platform.deletePost.controller.js';
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
router.route('/create-session-activity').post(validateData({ body: sessionActivitySchema }), createSessionActivityController);
router.route('/delete-session-activity').delete(deletePlatformSessionActivity);
router.route('/delete-post').delete(deletePlatformPost);
router.route('/get-all-platform-session-activity').get(getAllPlatformSessionActivities);
router.route('/get-session-activity/:activityId').get(getSessionActivity);
router.route('/update-session-activity').patch(validateData({ body: sessionActivitySchema }), updateSessionActivityController);
// router.route('/create-session-activity').post(validateData({ body: sessionActivitySchema }), verifyAdminMiddleware, createSessionActivityController);
// router.route('/delete-session-activity').delete(verifyAdminMiddleware, deletePlatformSessionActivity);
// router.route('/delete-post').delete(verifyAdminMiddleware, deletePlatformPost);
// router.route('/get-all-platform-session-activity').get(verifyAdminMiddleware, getAllPlatformSessionActivities);
// router.route('/get-session-activity/:activityId').get(verifyAdminMiddleware, getSessionActivity);
// router.route('/update-session-activity').patch(validateData({ body: sessionActivitySchema }), verifyAdminMiddleware, updateSessionActivityController);

export default router;
