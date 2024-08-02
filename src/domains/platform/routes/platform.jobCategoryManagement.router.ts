import express from 'express';
import { validateData } from '../../../middlewares/validateDataMiddleware.js';
import { sessionActivitySchema } from '../schemas/sessionActivity.schema.js';
import * as z from 'zod';

// middlewares
import authAndSessionsMiddleware from '../../../middlewares/authAndSessionMiddleware.js';
import verifyAdminMiddleware from '../../../middlewares/verifyAdminMiddleware.js';
import verifyUserDataToControllerMiddleware from '../../../middlewares/verifyUserDataToControllerMiddleware.js';

// end-points
import createPlatformJobCategory from '../controllers/jobsCategoryManagement/platform.createJobCategory.controller.js';
import updateJobCategory from '../controllers/jobsCategoryManagement/platform.updateJobCategory.controller.js';
import deletePlatformJobCategory from '../controllers/jobsCategoryManagement/platform.deleteJobCategory.controller.js';
import getJobCategory from '../controllers/jobsCategoryManagement/platform.getJobCategory.controller.js';
import getAllPlatformJobCategories from '../controllers/jobsCategoryManagement/platform.getAllPlatformJobCategories.controller.js';

// express router init
const router = express.Router();

export const paramsSchema = z.object({
  categoryId: z.string().length(4, { message: 'end-point param(categoryId) must be an ordered stringed number of exactly 4 characters long' })
});

// routes
router
  .route('/create-job-category')
  .post(
    authAndSessionsMiddleware,
    validateData({ body: sessionActivitySchema }),
    verifyAdminMiddleware,
    verifyUserDataToControllerMiddleware,
    createPlatformJobCategory
  );
router
  .route('/get-all-platform-job-categories')
  .get(authAndSessionsMiddleware, verifyAdminMiddleware, verifyUserDataToControllerMiddleware, getAllPlatformJobCategories);
router
  .route('/delete-job-category/:categoryId')
  .delete(
    authAndSessionsMiddleware,
    validateData({ params: paramsSchema }),
    verifyAdminMiddleware,
    verifyUserDataToControllerMiddleware,
    deletePlatformJobCategory
  );
router
  .route('/get-job-category/:categoryId')
  .get(
    authAndSessionsMiddleware,
    validateData({ params: paramsSchema }),
    verifyAdminMiddleware,
    verifyUserDataToControllerMiddleware,
    getJobCategory
  );
router
  .route('/update-job-category/:categoryId')
  .patch(
    authAndSessionsMiddleware,
    validateData({ body: sessionActivitySchema, params: paramsSchema }),
    verifyAdminMiddleware,
    verifyUserDataToControllerMiddleware,
    updateJobCategory
  );

export default router;
