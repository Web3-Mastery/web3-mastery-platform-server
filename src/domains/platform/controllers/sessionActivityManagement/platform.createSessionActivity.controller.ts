import type { Request, Response } from 'express';
import type { SessionActivitySpecs } from '../../schemas/sessionActivity.schema.js';
import { findSessionActivity } from '../../lib/platform.findSessionActivity.service.js';
import { createSessionActivity } from '../../lib/platform.createSessionActivity.service.js';
import { findUser } from '../../../user/lib/user.findUser.service.js';

// description: creates a new platform session activity
// request: POST
// route: '/api/v1/platform/session-activity-management/create-session-activity'
// access: Public

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    sessionActivity: SessionActivitySpecs;
    accessToken: string;
    sessionStatus?: string;
  };
};

const createSessionActivityController = async (req: Request<{}, ResponseSpecs, SessionActivitySpecs>, res: Response<ResponseSpecs>) => {
  if (req.user) {
    const { activityName, activityDescription, activityId } = req.body;
    const { userEmail, sessionStatus, newUserAccessToken, newUserRefreshToken } = req.user;

    const user = await findUser({ email: userEmail });

    if (!user || user.isAdmin !== true) {
      return res.status(403).json({
        error: 'request rejected',
        responseMessage: 'only platform administrators are allowed to perform this action'
      });
    }

    try {
      if (!activityName || !activityDescription || !activityId) {
        return res.status(400).json({
          error: 'required activity input missing',
          responseMessage: 'request unsuccessful: please provide all activity data'
        });
      }
      // console.log(email, name);

      const existingSessionActivity = await findSessionActivity({ activityId });

      if (existingSessionActivity) {
        return res.status(400).json({
          error: 'duplicate sessionActivity error',
          responseMessage: `a session activity with activityId: '${activityId}' already exist`
        });
      }

      const newSessionActivity = await createSessionActivity({ sessionActivityData: req.body });

      if (newSessionActivity && newUserAccessToken) {
        res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none', // Prevent CSRF attacks
          maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return res.status(200).json({
          responseMessage: 'session activity created successfully',
          response: {
            sessionActivity: newSessionActivity,
            accessToken: newUserAccessToken,
            sessionStatus
          }
        });
      }
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
    // }
  }
  return;
};

export default createSessionActivityController;
