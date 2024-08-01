import type { Request, Response } from 'express';
import type { PostSpecs } from '../../../posts/schemas/postSchema.zod.js';
import { findPost } from '../../../posts/lib/post.findPost.service.js';
import { createPost } from '../../../posts/lib/post.createPost.service.js';
import { findUser } from '../../../user/lib/user.findUser.service.js';
import { findSessionActivity } from '../../lib/platform.findSessionActivity.service.js';
import { findAndUpdateUser } from '../../../user/lib/user.findAndUpdateUser.service.js';

// description: creates a new platform post/content(only article-based posts/content for now)
// request: POST
// route: '/api/v1/platform/platform-posts-management/register-post'
// access: Public

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    registeredPost: PostSpecs;
    accessToken: string;
    sessionStatus?: string;
  };
};

const registerPost = async (req: Request<{}, ResponseSpecs, PostSpecs>, res: Response<ResponseSpecs>) => {
  const { postSlug } = req.body;

  if (req.user) {
    try {
      const { userEmail, sessionStatus, newUserAccessToken, newUserRefreshToken, subSessionActivityId: activityId } = req.user;

      /* No need for a similar check as below, due to too much data: Zod and Mongoose will handle that. Ensure that both the Zod and
      Mongoose Schemas are strictly verified/confirmed to block incomplete or error submissions since there is no extra check here. */
      // if (!postTitle || !postSlug || !postBrief) {
      //   return res.status(400).json({
      //     error: 'required activity input missing',
      //     responseMessage: 'request unsuccessful: please provide all activity data'
      //   });
      // }

      const user = await findUser({ email: userEmail });

      if (!user || user.isAdmin !== true) {
        return res.status(403).json({
          error: 'request rejected',
          responseMessage: 'only platform administrators are allowed to perform this process'
        });
      }

      const existingPost = await findPost({ postSlug: postSlug });

      if (existingPost) {
        return res.status(400).json({
          error: 'duplicate post detected',
          responseMessage: `request unsuccessful: a post with postSlug: '${postSlug}' already exist`
        });
      }

      const registeredPost = await createPost({ postData: req.body });

      // get current user activity
      const currentUserSubSessionActivity = await findSessionActivity({ activityId });

      if (user?.sessions && user?.sessions.length > 0 && registeredPost && newUserAccessToken && currentUserSubSessionActivity) {
        currentUserSubSessionActivity.contentActivityData = {
          contentType: 'article',
          contentTitle: registeredPost.postTitle,
          contentId: registeredPost._id && registeredPost._id,
          contentUrl: registeredPost.postLink
        };
        // console.log(user.sessions);
        const currentSession = user.sessions[user.sessions.length - 1];

        if (currentSession) {
          // const currentSubSession = currentSession[currentSession.length - 1];

          // const currentSessionId = currentSubSession?.sessionId;

          // const currentTimeInMilliseconds = Date.now();

          const newCurrentSubSessionObject = {
            // checkInTime: currentTimeInMilliseconds.toString(),
            subSessionActivity: currentUserSubSessionActivity
            // sessionId: currentSessionId // same id since they are on the same session
          };

          currentSession?.push(newCurrentSubSessionObject);

          await findAndUpdateUser({
            email: user.email,
            requestBody: {
              sessions: user.sessions
              // accessToken: newUserAccessToken
            }
          });

          res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none', // Prevent CSRF attacks
            maxAge: 24 * 60 * 60 * 1000 // 1 day
          });

          return res.status(201).json({
            responseMessage: 'post registered/created successfully',
            response: {
              registeredPost,
              accessToken: newUserAccessToken,
              sessionStatus
            }
          });
        }

        return;
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
  // }

  return;
};

export default registerPost;
