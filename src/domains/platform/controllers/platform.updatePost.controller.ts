import type { Request, Response } from 'express';
import type { PostSpecs } from '../../posts/schemas/postSchema.zod.js';
import { findPost } from '../../posts/lib/post.findPost.service.js';
import { findUser } from '../../user/lib/user.findUser.service.js';
import { findAndUpdatePost } from '../lib/post.findAndUpdatePost.service.js';

// description: deletes a new platform post/content(only article-based posts/content for now)
// request: PATCH
// route: '/api/v1/platform/update-post'
// access: Public

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    updatedPost: PostSpecs;
    accessToken: string;
    sessionStatus?: string;
  };
};

const updatePlatformPost = async (req: Request<{}, ResponseSpecs, PostSpecs>, res: Response<ResponseSpecs>) => {
  const { currentPostSlug } = req.query;

  const StringedCurrentPostSlug = currentPostSlug as string;

  if (req.user) {
    try {
      const { userEmail, sessionStatus, newUserAccessToken, newUserRefreshToken } = req.user;

      const user = await findUser({ email: userEmail });

      if (!user || user.isAdmin !== true) {
        return res.status(403).json({
          error: 'request rejected',
          responseMessage: 'only platform administrators are allowed to perform this process'
        });
      }

      /* No need for a similar check as below, due to too much data: Zod and Mongoose will handle that. Ensure that both the Zod and
      Mongoose Schemas are strictly verified/confirmed to block incomplete or error submissions since there is no extra check here. */
      // if (!postTitle || !postSlug || !postBrief) {
      //   return res.status(400).json({
      //     error: 'required activity input missing',
      //     responseMessage: 'request unsuccessful: please provide all activity data'
      //   });
      // }

      const existingPost = await findPost({ postSlug: StringedCurrentPostSlug });

      if (!existingPost) {
        return res.status(400).json({
          error: 'process empty',
          responseMessage: `platform post with postSlug: '${StringedCurrentPostSlug} does not exist or has already been deleted`
        });
      }

      const updatedPost = await findAndUpdatePost({ postSlug: StringedCurrentPostSlug, requestBody: req.body });

      if (updatedPost && newUserAccessToken) {
        res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none', // Prevent CSRF attacks
          maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return res.status(201).json({
          responseMessage: 'post/content was un-registered/deleted successfully',
          response: {
            updatedPost: updatedPost,
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

export default updatePlatformPost;