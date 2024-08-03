import type { Request, Response } from 'express';
import type { JobSpecs } from '../schemas/jobSchema.zod.js';
import { findAllJobs } from '../lib/jobs.findAllJobs.service.js';
// import { findUser } from '../../user/lib/user.findUser.service.js';

// description: gets all user's bookmarked jobs.
// request: GET
// route: '/api/v1/posts/get-user-jobs-bookmarks";
// access: Private

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    fetchedUserBookmarks: JobSpecs[];
    userBookmarksCount: string;
    accessToken: string;
    // extraData: {
    //   userHasReacted: boolean;
    //   userHasBookmarked: boolean;
    // };
    sessionStatus?: string;
  };
};

const getUserJobsBookmarks = async (req: Request<{}, ResponseSpecs>, res: Response<ResponseSpecs>) => {
  if (req.user) {
    try {
      const { sessionStatus, userId, newUserAccessToken, newUserRefreshToken } = req.user;

      const allPosts = await findAllJobs();

      // Filter posts bookmarked by the given user
      const userJobsBookmarks = allPosts.filter((job) => job.bookmarks.bookmarkedUsers.some((bookmark) => bookmark.userId.toString() === userId));

      if (userJobsBookmarks && newUserAccessToken && userId && newUserRefreshToken) {
        res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none', // Prevent CSRF attacks
          maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return res.status(200).json({
          responseMessage: `user profile fetched successfully`,
          response: {
            fetchedUserBookmarks: userJobsBookmarks,
            userBookmarksCount: String(userJobsBookmarks.length),
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

export default getUserJobsBookmarks;
