import type { Request, Response } from 'express';
import type { SessionActivitySpecs } from '../schemas/sessionActivity.schema.js';
import { findSessionActivity } from '../lib/platform.findSessionActivity.service.js';

// description: get user profile payout-data(by ID), and send back relevant data as response.
// request: GET
// route: '/api/v1/platform/get-session-activity";
// access: Private | external

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    sessionActivity: SessionActivitySpecs;
  };
};

const getSessionActivity = async (req: Request<{ activityId: string }, ResponseSpecs>, res: Response<ResponseSpecs>) => {
  try {
    // if (req.user) {
    const { activityId } = req.params;

    const existingSessionActivity = await findSessionActivity({ activityId });

    if (!existingSessionActivity) {
      return res.status(400).json({
        error: 'item not found',
        responseMessage: `session activity with activityId: '${activityId}' not found or does not exist`
      });
    }

    // update refresh token(cookie)
    // res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: 'none', // Prevent CSRF attacks
    //   maxAge: 24 * 60 * 60 * 1000 // 1 day
    // });

    return res.status(200).json({
      responseMessage: `user profile fetched successfully`,
      response: {
        sessionActivity: existingSessionActivity
      }
    });

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
};

export default getSessionActivity;
