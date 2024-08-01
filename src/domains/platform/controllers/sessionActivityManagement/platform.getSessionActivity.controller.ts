import type { Request, Response } from 'express';
import type { SessionActivitySpecs } from '../../schemas/sessionActivity.schema.js';
import { findSessionActivity } from '../../lib/platform.findSessionActivity.service.js';
import { findUser } from '../../../user/lib/user.findUser.service.js';

// description: get session activity, and send back relevant data as response.
// request: GET
// route: '/api/v1/platform/session-activity-management/get-session-activity/:activityId";
// access: Private(admin-only)

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    sessionActivity: SessionActivitySpecs;
    accessToken: string;
    sessionStatus?: string;
  };
};

const getSessionActivity = async (req: Request<{ activityId: string }, ResponseSpecs>, res: Response<ResponseSpecs>) => {
  if (req.user) {
    try {
      const { activityId } = req.params;

      const { userEmail, sessionStatus, newUserAccessToken, newUserRefreshToken } = req.user;

      const user = await findUser({ email: userEmail });

      if (!user || user.isAdmin !== true) {
        return res.status(403).json({
          error: 'request rejected',
          responseMessage: 'only platform administrators are allowed to perform this action'
        });
      }

      const existingSessionActivity = await findSessionActivity({ activityId });

      if (!existingSessionActivity) {
        return res.status(400).json({
          error: 'item not found',
          responseMessage: `session activity with activityId: '${activityId}' not found or does not exist`
        });
      }

      if (existingSessionActivity && newUserAccessToken) {
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
            sessionActivity: existingSessionActivity,
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

export default getSessionActivity;
