import express from 'express';
import { validateData } from '../../../middlewares/validateDataMiddleware.js';
import { sessionActivitySchema } from '../schemas/sessionActivity.schema.js';
import * as z from 'zod';
// middlewares
import authAndSessionsMiddleware from '../../../middlewares/authAndSessionMiddleware.js';
import verifyAdminMiddleware from '../../../middlewares/verifyAdminMiddleware.js';
import verifyUserDataToControllerMiddleware from '../../../middlewares/verifyUserDataToControllerMiddleware.js';
// end-points
import createPostCategory from '../controllers/postCategoryManagement/platform.createPostCategory.controller.js';
import deletePlatformPostCategory from '../controllers/postCategoryManagement/platform.deletePostCategory.controller.js';
import updatePostCategory from '../controllers/postCategoryManagement/platform.updatePostCategory.controller.js';
import getAllPlatformPostCategories from '../controllers/postCategoryManagement/platform.getAllPlatformPostCategories.controller.js';
import getPostCategory from '../controllers/postCategoryManagement/platform.getPostCategory.controller.js';
// express router init
const router = express.Router();
export const paramsSchema = z.object({
    categoryId: z.string().length(4, { message: 'end-point param(categoryId) must be an ordered stringed number of exactly 4 characters long' })
});
// routes
router
    .route('/create-post-category')
    .post(authAndSessionsMiddleware, validateData({ body: sessionActivitySchema }), verifyAdminMiddleware, verifyUserDataToControllerMiddleware, createPostCategory);
router
    .route('/get-all-platform-post-categories')
    .get(authAndSessionsMiddleware, verifyAdminMiddleware, verifyUserDataToControllerMiddleware, getAllPlatformPostCategories);
router
    .route('/delete-post-category/:categoryId')
    .delete(authAndSessionsMiddleware, validateData({ params: paramsSchema }), verifyAdminMiddleware, verifyUserDataToControllerMiddleware, deletePlatformPostCategory);
router
    .route('/get-post-category/:categoryId')
    .get(authAndSessionsMiddleware, validateData({ params: paramsSchema }), verifyAdminMiddleware, verifyUserDataToControllerMiddleware, getPostCategory);
router
    .route('/update-post-category/:categoryId')
    .patch(authAndSessionsMiddleware, validateData({ body: sessionActivitySchema, params: paramsSchema }), verifyAdminMiddleware, verifyUserDataToControllerMiddleware, updatePostCategory);
export default router;
