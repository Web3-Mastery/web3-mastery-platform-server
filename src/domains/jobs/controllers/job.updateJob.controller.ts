import type { Request, Response } from 'express';
import { findJob } from '../lib/jobs.findJob.service.js';
import { findAndUpdateJob } from '../lib/job.findAndUpdateJob.service.js';
import { findUser } from '../../user/lib/user.findUser.service.js';
import { findSessionActivity } from '../../platform/lib/sessionActivityManagement/platform.findSessionActivity.service.js';
import { findAndUpdateUser } from '../../user/lib/user.findAndUpdateUser.service.js';
import type { JobSpecs } from '../schemas/jobSchema.zod.js';

// description: updates job and sends back relevant data as response
// request: PATCH
// route: '/api/v1/jobs/update-job'
// access: Public

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    updatedJob: JobSpecs;
    accessToken: string;
    sessionStatus?: string;
  };
};

const updatePlatformPost = async (req: Request<{ jobId: string }, ResponseSpecs, JobSpecs>, res: Response<ResponseSpecs>) => {
  if (req.user) {
    const { jobId } = req.params;

    try {
      const { userEmail, sessionStatus, newUserAccessToken, newUserRefreshToken, subSessionActivityId: activityId } = req.user;

      const user = await findUser({ email: userEmail });

      const existingJob = await findJob({ jobId });

      if (!existingJob) {
        return res.status(400).json({
          error: 'process empty',
          responseMessage: `platform post with postSlug: '${jobId} does not exist or has already been deleted`
        });
      }

      const updatedJob = await findAndUpdateJob({ jobId: jobId, requestBody: req.body });

      // get current user activity
      const currentUserSubSessionActivity = await findSessionActivity({ activityId });

      if (user?.sessions && user?.sessions.length > 0 && updatedJob && updatedJob.jobLink && newUserAccessToken && currentUserSubSessionActivity) {
        currentUserSubSessionActivity.jobActivityData = {
          jobTitle: updatedJob.jobTitle,
          jobCategory: updatedJob.jobDescription,
          jobId: updatedJob?._id,
          jobUrl: updatedJob?.jobLink && updatedJob?.jobLink
        };

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
            responseMessage: 'post/content was un-registered/deleted successfully',
            response: {
              updatedJob,
              accessToken: newUserAccessToken,
              sessionStatus
            }
          });
        }

        return;
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
