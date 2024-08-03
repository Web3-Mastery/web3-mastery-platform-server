import type { Request, Response } from 'express';
import { findUser } from '../../user/lib/user.findUser.service.js';
import { findSessionActivity } from '../../platform/lib/sessionActivityManagement/platform.findSessionActivity.service.js';
import { findAndUpdateUser } from '../../user/lib/user.findAndUpdateUser.service.js';
import type { JobSpecs } from '../schemas/jobSchema.zod.js';
import { findJob } from '../lib/jobs.findJob.service.js';

// description: gets a platform post and also registers relevant data about that post on on the user's sub-session
// request: GET
// route: '/api/v1/jobs/get-job";
// access: Public

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    fetchedJob: JobSpecs;
    accessToken: string;
    extraData: {
      //   userHasReacted: boolean;
      userHasBookmarked: boolean;
    };
    sessionStatus?: string;
  };
};

const getJob = async (req: Request<{ jobId: string }, ResponseSpecs>, res: Response<ResponseSpecs>) => {
  if (req.user) {
    try {
      const { jobId } = req.params;
      const { subSessionActivityId: activityId, sessionStatus, userEmail, userId, newUserAccessToken, newUserRefreshToken } = req.user;

      const existingJob = await findJob({ jobId });

      const user = await findUser({ email: userEmail });

      // if (!user) {
      //   return res.status(403).json({
      //     error: 'request rejected',
      //     responseMessage: `user with id: '${userId}' not found or does not exist`
      //   });
      // }

      if (!existingJob) {
        return res.status(400).json({
          error: 'item not found',
          responseMessage: `requested job with jobId: '${jobId}' not found or does not exist`
        });
      }

      // get current user activity
      const currentUserSubSessionActivity = await findSessionActivity({ activityId });

      //   const reactedUsers = foundPost.reactions.reactedUsers;

      const bookmarkedUsers = existingJob.bookmarks.bookmarkedUsers;

      if (currentUserSubSessionActivity && newUserAccessToken && userId && newUserRefreshToken) {
        // check if user has liked this post => no reaction on jobs
        // const hasUserReacted = reactedUsers?.find((each) => {
        //   return (each.userId = userId);
        // });

        // check if user has bookmarked this post
        const hasUserBookmarked = bookmarkedUsers?.find((each) => {
          return (each.userId = userId);
        });

        currentUserSubSessionActivity.jobActivityData = {
          jobTitle: existingJob.jobTitle,
          jobCategory: existingJob.jobCategory,
          jobId: existingJob._id && existingJob._id,
          jobUrl: existingJob.jobLink!
        };

        if (user?.sessions && user?.sessions.length > 0) {
          // console.log(user.sessions);
          const currentSession = user.sessions[user.sessions.length - 1];

          if (currentSession) {
            const currentSubSession = currentSession[currentSession.length - 1];

            // const currentSessionId = currentSubSession?.sessionId;

            // const currentTimeInMilliseconds = Date.now();

            const newCurrentSubSessionObject = {
              ...currentSubSession,
              //   checkInTime: currentTimeInMilliseconds.toString(),
              subSessionActivity: currentUserSubSessionActivity
              // sessionId: currentSessionId // same id since they are on the same session
            };

            currentSession[currentSession?.length - 1] = newCurrentSubSessionObject;

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

            return res.status(200).json({
              responseMessage: `user profile fetched successfully`,
              response: {
                fetchedJob: existingJob,
                accessToken: newUserAccessToken,
                extraData: {
                  //   userHasReacted: hasUserReacted ? true : false,
                  userHasBookmarked: hasUserBookmarked ? true : false
                },
                sessionStatus: sessionStatus
              }
            });
          }

          return;
        }

        return;
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

export default getJob;
