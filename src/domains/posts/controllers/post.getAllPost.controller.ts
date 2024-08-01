import type { Request, Response } from 'express';
import type { PostSpecs } from '../schemas/postSchema.zod.js';
import { findAllPosts } from '../lib/post.findAllPosts.service.js';
// import { findUser } from '../../user/lib/user.findUser.service.js';

// description: gets all platform posts/content.
// request: GET
// route: '/api/v1/posts/get-all-posts";
// access: Private | external

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    fetchedPosts: PostSpecs[];
    allPostsCount: string;
    accessToken: string;
    // extraData: {
    //   userHasReacted: boolean;
    //   userHasBookmarked: boolean;
    // };
    sessionStatus?: string;
  };
};

const getAllPost = async (req: Request<{}, ResponseSpecs>, res: Response<ResponseSpecs>) => {
  if (req.user) {
    try {
      const { sessionStatus, userId, newUserAccessToken, newUserRefreshToken } = req.user;

      // const user = await findUser({ email: userEmail });

      // if (!user) {
      //   return res.status(403).json({
      //     error: 'request rejected',
      //     responseMessage: `user with id: '${userId}' not found or does not exist`
      //   });
      // }

      const allPosts = await findAllPosts();

      if (allPosts && newUserAccessToken && userId && newUserRefreshToken) {
        res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none', // Prevent CSRF attacks
          maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return res.status(200).json({
          responseMessage: `user profile fetched successfully`,
          response: {
            fetchedPosts: allPosts,
            allPostsCount: String(allPosts.length),
            accessToken: newUserAccessToken,
            sessionStatus: sessionStatus
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

export default getAllPost;
