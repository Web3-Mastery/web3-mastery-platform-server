import type { Request, Response } from 'express';
import type { SessionActivitySpecs } from '../../schemas/sessionActivity.schema.js';
import { fetchAllPlatformSessionActivities } from '../../lib/sessionActivityManagement/platform.fetchAllSessionActivities.service.js';
import { findUser } from '../../../user/lib/user.findUser.service.js';

// description: get all platform session-activities, and send back relevant data as response.
// request: GET
// route: '/api/v1/platform/session-activity-management/get-all-platform-session-activities";
// access: Public

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    platformSessionActivitiesCount: number;
    platformSessionActivities: SessionActivitySpecs[];
    accessToken: string;
    sessionStatus?: string;
  };
};

// @ts-ignore
const getAllPlatformSessionActivities = async (req: Request<{}, ResponseSpecs>, res: Response<ResponseSpecs>) => {
  if (req.user) {
    try {
      const { userEmail, sessionStatus, newUserAccessToken, newUserRefreshToken } = req.user;

      const user = await findUser({ email: userEmail });

      if (!user || user.isAdmin !== true) {
        return res.status(403).json({
          error: 'request rejected',
          responseMessage: 'only platform administrators are allowed to perform this action'
        });
      }

      const platformSessionActivities = await fetchAllPlatformSessionActivities();

      if (!platformSessionActivities) {
        return res.status(400).json({
          error: 'item not found',
          responseMessage: `could not fetch platform session activity list: list not found of does not exist`
        });
      }

      if (platformSessionActivities && newUserAccessToken) {
        res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none', // Prevent CSRF attacks
          maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return res.status(200).json({
          responseMessage: `user profile fetched successfully`,
          response: {
            platformSessionActivitiesCount: platformSessionActivities.length,
            platformSessionActivities: platformSessionActivities,
            accessToken: newUserAccessToken,
            sessionStatus
          }
        });
      }

      // }

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

export default getAllPlatformSessionActivities;
