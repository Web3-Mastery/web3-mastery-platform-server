import type { Request, Response } from 'express';
import type { PostCategorySpecs } from '../../schemas/postCategory.schema.js';
import { findPostCategory } from '../../lib/platform.findPostCategory.service.js';
import { findUser } from '../../../user/lib/user.findUser.service.js';

// description: get session activity, and send back relevant data as response.
// request: GET
// route: '/api/v1/platform/post-category-management/get-post-category/:categoryId";
// access: Private(admin-only)

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    postCategory: PostCategorySpecs;
    accessToken: string;
    sessionStatus?: string;
  };
};

const getPostCategory = async (req: Request<{ categoryId: string }, ResponseSpecs>, res: Response<ResponseSpecs>) => {
  if (req.user) {
    try {
      const { categoryId } = req.params;

      const { userEmail, sessionStatus, newUserAccessToken, newUserRefreshToken } = req.user;

      const user = await findUser({ email: userEmail });

      if (!user || user.isAdmin !== true) {
        return res.status(403).json({
          error: 'request rejected',
          responseMessage: 'only platform administrators are allowed to perform this action'
        });
      }

      const existingPostCategory = await findPostCategory({ categoryId });

      if (!existingPostCategory) {
        return res.status(400).json({
          error: 'item not found',
          responseMessage: `post category with categoryId: '${categoryId}' not found or does not exist`
        });
      }

      if (existingPostCategory && newUserAccessToken) {
        // update refresh token(cookie)
        res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none', // Prevent CSRF attacks
          maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return res.status(200).json({
          responseMessage: `user profile fetched successfully`,
          response: {
            postCategory: existingPostCategory,
            accessToken: newUserAccessToken,
            sessionStatus
          }
        });
      }

      return;
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          responseMessage: 'request was unsuccessful',
          error: error.message
        });
      } else {
        return res.status(500).json({
          responseMessage: 'request was unsuccessful: please try again',
          error: error as string
        });
      }
    }
  }

  return;
};

export default getPostCategory;
