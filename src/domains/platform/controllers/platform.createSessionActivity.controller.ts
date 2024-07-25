import type { Request, Response } from 'express';
import type { SessionActivitySpecs } from '../schemas/sessionActivity.schema.js';
import { findSessionActivity } from '../lib/platform.findSessionActivity.service.js';
import { createSessionActivity } from '../lib/platform.createSessionActivity.service.js';

// description: creates a new platform session activity
// request: POST
// route: '/api/v1/platform/create-session-activity'
// access: Public

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    sessionActivity: SessionActivitySpecs;
  };
};

const createSessionActivityController = async (req: Request<{}, ResponseSpecs, SessionActivitySpecs>, res: Response<ResponseSpecs>) => {
  const { activityName, activityDescription, activityId } = req.body;

  try {
    // if (req.user) {
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

    if (newSessionActivity) {
      return res.status(200).json({
        responseMessage: 'session activity created successfully',
        response: {
          sessionActivity: newSessionActivity
        }
      });
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
  // }

  return;
};

export default createSessionActivityController;
