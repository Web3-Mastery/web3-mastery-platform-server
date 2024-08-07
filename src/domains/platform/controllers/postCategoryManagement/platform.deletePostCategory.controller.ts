import type { Request, Response } from 'express';
import type { DeleteResult } from 'mongodb';
// import nodemailer from 'nodemailer';
import type { PostCategorySpecs } from '../../schemas/postCategory.schema.js';
import { findPostCategory } from '../../lib/postCategoryManagement/platform.findPostCategory.service.js';
import { deletePostCategory } from '../../lib/postCategoryManagement/platform.deletePostCategory.service.js';
import { findUser } from '../../../user/lib/user.findUser.service.js';

// description: deletes a platform post-category
// request: DELETE
// route: '/api/v1/platform/post-category-management/delete-post-category/:categoryId'
// access: Private

type ResponseSpecs = {
  error?: string | {};
  responseMessage: string;
  response?: {
    deleteResult: DeleteResult;
    deletedPostCategory: PostCategorySpecs;
    accessToken: string;
    sessionStatus?: string;
  };
};

const deletePlatformPostCategory = async (req: Request<{}, ResponseSpecs, PostCategorySpecs>, res: Response<ResponseSpecs>) => {
  if (req.user) {
    const { postCategoryId } = req.query;

    const _categoryId = postCategoryId as string;
    try {
      const { userEmail, sessionStatus, newUserAccessToken, newUserRefreshToken } = req.user;

      const user = await findUser({ email: userEmail });

      if (!user || user.isAdmin !== true) {
        return res.status(403).json({
          error: 'request rejected',
          responseMessage: 'only platform administrators are allowed to perform this action'
        });
      }

      const existingPostCategory = await findPostCategory({ categoryId: _categoryId });
      // console.log(existingSessionActivity);

      if (!existingPostCategory) {
        return res.status(400).json({
          error: 'process empty',
          responseMessage: `post-category with categoryId: '${_categoryId}' does not exist or has already been deleted`
        });
      }

      const deletedResponse = await deletePostCategory({ categoryId: _categoryId });

      if (deletedResponse && deletedResponse.acknowledged === true && newUserAccessToken && newUserRefreshToken) {
        //  update refresh token(cookie)
        res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none', // Prevent CSRF attacks
          maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return res.status(201).json({
          responseMessage: 'post-category deleted successfully',
          response: {
            deleteResult: deletedResponse,
            deletedPostCategory: existingPostCategory,
            accessToken: newUserAccessToken,
            sessionStatus
          }
        });
      }

      return;
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        const errorString = error.message as string;

        return res.status(500).json({
          responseMessage: 'process error',
          error: errorString
        });
      } else {
        console.log(error);
        return res.status(500).json({
          responseMessage: 'process error: please try again',
          error: error as string
        });
      }
    }
  }

  return;
};

export default deletePlatformPostCategory;
