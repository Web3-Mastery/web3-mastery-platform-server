import type { Request, Response } from 'express';
import { findUser } from '../../user/lib/user.findUser.service.js';
import { findSessionActivity } from '../../platform/lib/sessionActivityManagement/platform.findSessionActivity.service.js';
import { findAndUpdateUser } from '../../user/lib/user.findAndUpdateUser.service.js';
import type { JobSpecs } from '../schemas/jobSchema.zod.js';
import { findJob } from '../lib/jobs.findJob.service.js';
import { findAndUpdateJob } from '../lib/job.findAndUpdateJob.service.js';

// description: increases the job-bookmark count and indicates(on the response) that the user has bookmarked a job
// request: PATCH
// route: '/api/v1/jobs/bookmark-job";
// access: Public

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    bookmarkedJob: JobSpecs;
    extraData: {
      // userHasReacted: boolean;
      userHasBookmarked: boolean;
    };
    accessToken: string;
    sessionStatus?: string;
  };
};

const bookmarkJob = async (req: Request<{ jobId: string }, ResponseSpecs>, res: Response<ResponseSpecs>) => {
  if (req.user) {
    try {
      const { jobId } = req.params;
      const { subSessionActivityId: activityId, sessionStatus, userEmail, userId, newUserAccessToken, newUserRefreshToken } = req.user;

      const user = await findUser({ email: userEmail });

      const existingJob = await findJob({ jobId: jobId });

      if (!existingJob) {
        return res.status(400).json({
          error: 'item not found',
          responseMessage: `requested job with jobId: '${jobId}' not found or does not exist`
        });
      }

      // get current user activity
      const currentUserSubSessionActivity = await findSessionActivity({ activityId });

      if (existingJob && existingJob.jobLink && user && currentUserSubSessionActivity && newUserAccessToken && userId && newUserRefreshToken) {
        // increase postBookmarkCount
        const currentNumberOfJobBookmarks = existingJob.bookmarks.bookmarksCount;

        const newCurrentNumberOfJobBookmarks = Number(currentNumberOfJobBookmarks) + 1;

        // update job data
        // add bookmarking user to postBookmarkUsers list
        const newBookmarkUsersArray = [...existingJob.bookmarks.bookmarkedUsers, { userId: user._id }];
        // I supposed this also works => // const newBookmarkUsersArray = existingJob.bookmarks.bookmarkedUsers.push(existingJob)

        const updatedJobData = await findAndUpdateJob({
          jobId: jobId,
          requestBody: {
            ...existingJob,
            bookmarks: {
              bookmarksCount: newCurrentNumberOfJobBookmarks.toString(),
              bookmarkedUsers: newBookmarkUsersArray
            }
          }
        });

        // const updatedUserData = await findAndUpdateUser({
        //   email: userEmail,
        //   requestBody: {
        //     savedJobs: user.savedJobs
        //   }
        // });

        // equally unnecessary as in the post case - cos we just added the user to the list as shown above
        // const bookmarkedUsers = existingJob.bookmarks.bookmarkedUsers;

        // // check if user has bookmarked this post
        // const hasUserBookmarked = bookmarkedUsers?.find((each) => {
        //   return (each.userId = userId);
        // });

        currentUserSubSessionActivity.jobActivityData = {
          jobTitle: existingJob.jobTitle,
          jobCategory: existingJob.jobCategory,
          jobId: existingJob._id && existingJob._id,
          jobUrl: existingJob.jobLink
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

            // add existing job to user's bookmarked-jobs list
            user?.savedJobs?.push(existingJob);

            await findAndUpdateUser({
              email: user.email,
              requestBody: {
                sessions: user.sessions,
                savedJobs: user.savedJobs
                // accessToken: newUserAccessToken
              }
            });

            if (updatedJobData) {
              // there is not reacting to jobs - but leave code for now - might need later
              // const bookmarkedUsers = updatedPostData.reactions.reactedUsers;

              // // check if user has liked this post
              // const hasUserReacted = bookmarkedUsers?.find((each) => {
              //   return (each.userId = userId);
              // });

              res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'none', // Prevent CSRF attacks
                maxAge: 24 * 60 * 60 * 1000 // 1 day
              });

              return res.status(200).json({
                responseMessage: `user profile fetched successfully`,
                response: {
                  bookmarkedJob: updatedJobData,
                  extraData: {
                    // userHasReacted: hasUserReacted ? true : false,
                    userHasBookmarked: true
                    // userHasBookmarked: hasUserBookmarked ? true : false // straight-up true cos we just added the user as seen above
                  },
                  accessToken: newUserAccessToken,
                  sessionStatus: sessionStatus
                }
              });
            }
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

export default bookmarkJob;
