import express from 'express';
import { sessionActivitySchema } from '../schemas/sessionActivity.schema.js';
import * as z from 'zod';

// middlewares
import { validateData } from '../../../middlewares/validateDataMiddleware.js';
import authAndSessionsMiddleware from '../../../middlewares/authAndSessionMiddleware.js';
import verifyAdminMiddleware from '../../../middlewares/verifyAdminMiddleware.js';
import verifyUserDataToControllerMiddleware from '../../../middlewares/verifyUserDataToControllerMiddleware.js';

// end-points
import createSessionActivityController from '../controllers/sessionActivityManagement/platform.createSessionActivity.controller.js';
import updateSessionActivityController from '../controllers/sessionActivityManagement/platform.updateSessionActivity.controller.js';
import deletePlatformSessionActivity from '../controllers/sessionActivityManagement/platform.deleteSessionActivity.controller.js';
import getAllPlatformSessionActivities from '../controllers/sessionActivityManagement/platform.getAllSessionActivities.controller.js';
import getSessionActivity from '../controllers/sessionActivityManagement/platform.getSessionActivity.controller.js';

// express router init
const router = express.Router();

// param type checking/validation
export const paramsSchema = z.object({
  activityId: z.string().length(4, { message: 'end-point param(activityId) must be an ordered stringed number of exactly 4 characters long' })
});

// routes
router
  .route('/create-session-activity')
  .post(
    authAndSessionsMiddleware,
    validateData({ body: sessionActivitySchema }),
    verifyAdminMiddleware,
    verifyUserDataToControllerMiddleware,
    createSessionActivityController
  );
router
  .route('/get-all-platform-session-activities')
  .get(authAndSessionsMiddleware, verifyAdminMiddleware, verifyUserDataToControllerMiddleware, getAllPlatformSessionActivities);
router
  .route('/delete-session-activity/:activityId')
  .delete(
    authAndSessionsMiddleware,
    validateData({ params: paramsSchema }),
    verifyAdminMiddleware,
    verifyUserDataToControllerMiddleware,
    deletePlatformSessionActivity
  );
router
  .route('/get-session-activity/:activityId')
  .get(
    authAndSessionsMiddleware,
    validateData({ params: paramsSchema }),
    verifyAdminMiddleware,
    verifyUserDataToControllerMiddleware,
    getSessionActivity
  );
router
  .route('/update-session-activity/:activityId')
  .patch(
    authAndSessionsMiddleware,
    validateData({ body: sessionActivitySchema, params: paramsSchema }),
    verifyAdminMiddleware,
    verifyUserDataToControllerMiddleware,
    updateSessionActivityController
  );

export default router;
