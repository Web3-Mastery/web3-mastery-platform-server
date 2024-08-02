// import { TokenExpiredError } from 'jsonwebtoken';
import { type Request, type Response, type NextFunction } from 'express';
import { findSessionActivity } from '../domains/platform/lib/sessionActivityManagement/platform.findSessionActivity.service.js';
import type { SessionActivitySpecs } from '../domains/platform/schemas/sessionActivity.schema.js';
import { findPreSignUpUser } from '../domains/user/lib/user.findPreSignUpUser.service.js';
import type { UserSpecs } from '../domains/user/schemas/userSchema.zod.js';
import { findAndUpdatePreSignUpUser } from '../domains/user/lib/user.findAndUpdatePreSignUpUser.service.js';
import { findUser } from '../domains/user/lib/user.findUser.service.js';
import { findAndUpdateUser } from '../domains/user/lib/user.findAndUpdateUser.service.js';
// import generateTokens from '../utils/generateTokens.js';

type RequestHeaderContentSpecs = {
  authorization: string;
  email: string;
  sub_session_activity_id: string;
};

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    user: UserSpecs;
    // token: string;
  };
};

/* A middleware that does not check for the refresh token. Basically it is used on the 'login' and 'start-signup' end-points
One of it's core purpose is to create/start sessions */

// @ts-ignore
const openAccessSessionsMiddleware = async (req: Request, res: Response<ResponseSpecs>, next: NextFunction) => {
  try {
    const requestHeaders = req.headers;
    const { email: emailFromRequestBody } = req.body;

    const { email, sub_session_activity_id } = requestHeaders as RequestHeaderContentSpecs;

    if (email !== emailFromRequestBody) {
      return res.status(403).json({
        error: 'user error',
        responseMessage: `user/email provided in request header is not authorized to perform actions for user with email: '${emailFromRequestBody}'`
      });
    }

    const preSignUpUser = await findPreSignUpUser({ email });
    // console.log(preSignUpUser);

    const user = await findUser({ email });
    // console.log(user);

    if (!sub_session_activity_id || !email) {
      return res.status(401).json({
        error: 'access forbidden',
        responseMessage: `request header data missing or is not provided: 'email' and 'sub_session_activity_id' 
        must be provided as request header data`
      });
    }
    // console.log('user', user);

    const currentSubSessionActivity = (await findSessionActivity({ activityId: sub_session_activity_id })) as SessionActivitySpecs;

    if (preSignUpUser && !user) {
      if (preSignUpUser.sessions && preSignUpUser.sessions.length > 0) {
        // console.log(preSignUpUser.sessions);
        const currentSession = preSignUpUser.sessions[preSignUpUser.sessions.length - 1];

        if (currentSession) {
          const currentSubSession = currentSession[currentSession.length - 1];

          const currentSessionId = currentSubSession?.sessionId;
          // console.log(currentSessionId);

          const newSessionId = Number(currentSessionId) + 1;
          // console.log(newSessionId);

          const currentTimeInMilliseconds = Date.now();
          // console.log(sub_session_activity);

          const newCurrentSubSessionObject = {
            checkInTime: currentTimeInMilliseconds.toString(),
            subSessionActivity: currentSubSessionActivity,
            sessionId: newSessionId.toString() // same id since they are on the same session
          };

          preSignUpUser.sessions?.push([newCurrentSubSessionObject]);

          await findAndUpdatePreSignUpUser({
            email: preSignUpUser.email,
            requestBody: {
              sessions: preSignUpUser.sessions
              // accessToken: accessToken
            }
          });
        }
      }
    }

    if (user) {
      if (user.sessions && user.sessions.length > 0) {
        // console.log(user.sessions);
        const currentSession = user.sessions[user.sessions.length - 1];

        if (currentSession) {
          const currentSubSession = currentSession[currentSession.length - 1];

          const currentSessionId = currentSubSession?.sessionId;

          const newSessionId = Number(currentSessionId) + 1;

          const currentTimeInMilliseconds = Date.now();
          // console.log(sub_session_activity);

          const newCurrentSubSessionObject = {
            checkInTime: currentTimeInMilliseconds.toString(),
            subSessionActivity: currentSubSessionActivity,
            sessionId: newSessionId.toString() // same id since they are on the same session
          };

          user.sessions?.push([newCurrentSubSessionObject]);

          await findAndUpdateUser({
            email: user.email,
            requestBody: {
              sessions: user.sessions
            }
          });
        }
      }
    }

    req.user = {
      subSessionActivityId: sub_session_activity_id
    };

    // proceed to next middleware or route

    next();
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    } else {
      console.log(error);
      throw new Error('An error occurred');
    }
  }
};

export default openAccessSessionsMiddleware;
