import type { Request, Response } from 'express';
import type { DeleteResult } from 'mongodb';
// import nodemailer from 'nodemailer';
import type { SessionActivitySpecs } from '../schemas/sessionActivity.schema.js';
import { deleteSessionActivity } from '../lib/platform.deleteSessionActivity.service.js';
import { findSessionActivity } from '../lib/platform.findSessionActivity.service.js';

// description: deletes a platform session activity
// request: POST
// route: '/api/v1/platform/delete-session-activity'
// access: Public

type ResponseSpecs = {
  error?: string | {};
  responseMessage: string;
  response?: {
    deletedSessionActivity: SessionActivitySpecs;
    deleteResult: DeleteResult;
  };
};

const deletePlatformSessionActivity = async (req: Request<{}, ResponseSpecs, SessionActivitySpecs>, res: Response<ResponseSpecs>) => {
  const { sessionActivityId } = req.query;
  console.log(sessionActivityId);

  try {
    // if (req.user) {
    const _sessionActivityId = sessionActivityId as string;

    if (!_sessionActivityId) {
      res.status(400).json({
        error: 'missing input error',
        responseMessage: 'expected sessionActivityId request query was not added or was not provided'
      });
    }

    const existingSessionActivity = await findSessionActivity({ activityId: _sessionActivityId });
    // console.log(existingSessionActivity);

    if (!existingSessionActivity) {
      return res.status(400).json({
        error: 'process empty',
        responseMessage: `session activity with activityId: '${_sessionActivityId} does not exist or has already been deleted'`
      });
    }

    const deletedSessionActivity = await deleteSessionActivity({ activityId: _sessionActivityId });

    // update refresh token(cookie)
    //   res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: 'none', // Prevent CSRF attacks
    //     maxAge: 24 * 60 * 60 * 1000 // 1 day

    if (deletedSessionActivity && deletedSessionActivity.acknowledged === true) {
      return res.status(201).json({
        responseMessage: 'session activity deleted successfully',
        response: {
          deletedSessionActivity: existingSessionActivity,
          deleteResult: deletedSessionActivity
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

  return;
};

export default deletePlatformSessionActivity;
