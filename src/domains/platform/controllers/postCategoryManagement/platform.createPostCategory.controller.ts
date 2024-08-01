import type { Request, Response } from 'express';
import type { PostCategorySpecs } from '../../schemas/postCategory.schema.js';
import { findPostCategory } from '../../lib/platform.findPostCategory.service.js';
import { findUser } from '../../../user/lib/user.findUser.service.js';
import { createPostCategory } from '../../lib/platform.createPostCategory.service.js';

// description: creates a new platform post/content category
// request: POST
// route: '/api/v1/platform/post-category-management/create-post-category'
// access: Private(admin only)

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    postCategory: PostCategorySpecs;
    accessToken: string;
    sessionStatus?: string;
  };
};

const createPlatformPostCategory = async (req: Request<{}, ResponseSpecs, PostCategorySpecs>, res: Response<ResponseSpecs>) => {
  if (req.user) {
    try {
      const { categoryId } = req.body;
      const { userEmail, sessionStatus, newUserAccessToken, newUserRefreshToken } = req.user;

      const user = await findUser({ email: userEmail });

      if (!user || user.isAdmin !== true) {
        return res.status(403).json({
          error: 'request rejected',
          responseMessage: 'only platform administrators are allowed to perform this action'
        });
      }

      const existingPostCategory = await findPostCategory({ categoryId });

      if (existingPostCategory) {
        return res.status(400).json({
          error: 'duplicate post category detected',
          responseMessage: `request unsuccessful: a post category with categoryId: '${categoryId}' already exist`
        });
      }

      const newPostCategory = await createPostCategory({ postCategoryData: req.body });

      if (newPostCategory && newUserAccessToken) {
        res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none', // Prevent CSRF attacks
          maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return res.status(200).json({
          responseMessage: 'post category created successfully',
          response: {
            postCategory: newPostCategory,
            accessToken: newUserAccessToken,
            sessionStatus
          }
        });
      }

      // }
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
  // }

  return;
};

export default createPlatformPostCategory;
