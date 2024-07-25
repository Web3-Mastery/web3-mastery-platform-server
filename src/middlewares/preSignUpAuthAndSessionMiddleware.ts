import jwt from 'jsonwebtoken';
// import { TokenExpiredError } from 'jsonwebtoken';
import { type Request, type Response, type NextFunction } from 'express';
import type { UserSpecs } from '../domains/user/schemas/userSchema.zod.js';
import generateTokens from '../utils/generateTokens.js';
// import { findAndUpdateUser } from '../domains/user/lib/user.findAndUpdateUser.service.js';
import { findPreSignUpUser } from '../domains/user/lib/user.findPreSignUpUser.service.js';
import { findAndUpdatePreSignUpUser } from '../domains/user/lib/user.findAndUpdatePreSignUpUser.service.js';
// import generateTokens from '../utils/generateTokens.js';
import { findSessionActivity } from '../domains/platform/lib/platform.findSessionActivity.service.js';
import type { SessionActivitySpecs } from '../domains/platform/schemas/sessionActivity.schema.js';

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
    token: string;
  };
};

type JwtPayloadSpecs = {
  userId: string;
  userEmail: string;
  iat: number;
  exp: number;
};

const authAndSessionsMiddleware = async (req: Request, res: Response<ResponseSpecs>, next: NextFunction) => {
  const requestHeaders = req.headers;
  console.log(requestHeaders);

  const { email, authorization, sub_session_activity_id } = requestHeaders as RequestHeaderContentSpecs;
  const jwtSecret = process.env.JWT_SECRET as string;

  // console.log(email);
  // console.log(authorization);

  try {
    // console.log('authAndSessionMiddleware started');
    if (!email || !authorization || !sub_session_activity_id) {
      return res.status(401).json({
        error: 'access forbidden',
        responseMessage: `request header data missing or is not provided: 'email', 'authorization', 
        and 'sub_session_activity_id' must be provided as request header data`
      });
    }

    if (!req.headers.cookie || !req.headers.cookie.includes('Web3Mastery_SecretRefreshToken')) {
      return res.status(401).json({
        error: 'access forbidden',
        responseMessage: 'user does not have access to the route - please attempt a fresh log-in'
      });
    }

    //check if user exist
    const preSignUpUser = await findPreSignUpUser({ email });
    // console.log(preSignUpUser);

    // one of both userTypes should already exist
    if (!preSignUpUser) {
      return res.status(404).json({
        error: 'access forbidden',
        responseMessage: 'user not found or does not exist - user does not have access to this route'
      });
    }

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(403).json({
        error: 'access forbidden',
        responseMessage: 'authorization string does not match expected(Bearer Token) result'
      });
    }

    const currentSubSessionActivity = (await findSessionActivity({ activityId: sub_session_activity_id })) as SessionActivitySpecs;
    const returnedToken = authorization.split(' ')[1];
    // console.log(returnedToken);

    if (returnedToken && preSignUpUser) {
      const decodedJWT = jwt.verify(returnedToken, jwtSecret) as JwtPayloadSpecs;
      // console.log(decodedJWT);

      // console.log(decodedJWT.userId);
      // console.log(user._id);

      if (!decodedJWT || decodedJWT.userEmail !== preSignUpUser?.email) {
        return res.status(403).json({
          error: 'access forbidden',
          responseMessage: 'user credentials do not match'
        });
      }

      const generatedTokens = await generateTokens({ user: preSignUpUser });
      const { refreshToken, accessToken } = generatedTokens as {
        accessToken: string;
        refreshToken: string;
      };

      // console.log(generateTokens);

      /* proceed to renew user session here: update the 'durationSinceLastSession' field in the current/ongoing session */
      /* session data: 1. startTime(time in milliseconds), 2. endTime("nill or null if being renewed"), 3. UserIPAddress, 4. userLocation,
      5. user's device data(an array of objects - get and add as much as possible), 6. duration since last session - check for previous user session end-time, 
      and find the difference between it and the start time of the new session, then save - the front-end should convert to minutes, hours
      days, months, or years.  */
      // to keep things simple and fast, make only 'startTime' and 'endTime' compulsory. You can get the other data from the front-end and update in the future

      // P.S: first user session will be created in the signup controller - hence initial 'durationSinceLastSession' will be = 0
      // update the 'durationSinceLastSession' property of the current user session.
      // for user with only a single session

      if (preSignUpUser.sessions && preSignUpUser.sessions.length > 0) {
        // console.log(preSignUpUser.sessions);
        const currentSession = preSignUpUser.sessions[preSignUpUser.sessions.length - 1];

        if (currentSession) {
          const currentSubSession = currentSession[currentSession.length - 1];

          const currentSessionId = currentSubSession?.sessionId;

          const currentTimeInMilliseconds = Date.now();

          const newCurrentSubSessionObject = {
            checkInTime: currentTimeInMilliseconds.toString(),
            subSessionActivity: currentSubSessionActivity,
            sessionId: currentSessionId // same id since they are on the same session
          };

          currentSession?.push(newCurrentSubSessionObject);

          await findAndUpdatePreSignUpUser({
            email: preSignUpUser.email,
            requestBody: {
              sessions: preSignUpUser.sessions,
              accessToken: accessToken
            }
          });
        }
      }

      const sessionStatus = `user SESSION STILL VALID: user access-token and session for ${decodedJWT.userEmail} has been RENEWED successfully`;
      // console.log(sessionStatus);

      req.user = {
        userId: decodedJWT.userId,
        userEmail: decodedJWT.userEmail,
        sessionStatus,
        newUserAccessToken: accessToken,
        newUserRefreshToken: refreshToken,
        subSessionActivityId: sub_session_activity_id
      };
    }

    // console.log(req.user);

    // proceed to next middleware or route
    next();
  } catch (error) {
    if (error instanceof Error && error.message === 'jwt expired') {
      /* Access token is expired. Verify token(ignoring expiry) to make sure it's the user,
      then regenerate new tokens(access and refresh) and pass from middleware */

      const currentSubSessionActivity = (await findSessionActivity({ activityId: sub_session_activity_id })) as SessionActivitySpecs;
      const preSignUpUser = (await findPreSignUpUser({ email }))!;
      // console.log(`catch block ${user}`);

      /* Needed to get user, and perform a DB check afresh so that TS won't complain that user might be undefined, but 
     preferred to use the non-null assertion operator to insist that user already exist*/

      // if (!user) {
      //   return res.status(404).json({
      //     error: 'access forbidden',
      //     responseMessage: 'user not found: user does not have access to this route'
      //   });
      // }

      const generatedTokens = await generateTokens({ user: preSignUpUser });
      const { refreshToken, accessToken } = generatedTokens as {
        accessToken: string;
        refreshToken: string;
      };

      /* proceed to renew user session here: update the 'durationSinceLastSession' field in the current/ongoing session first, then update the session end time field, and create a new session */
      /* session data: 1. startTime(time in milliseconds), 2. endTime("nill or null if being renewed"), 3. UserIPAddress, 4. userLocation,
      5. user's device data(an array of objects - get and add as much as possible), 6. duration since last session - check for previous user session end-time, 
      and find the difference between it and the start time of the new session, then save - the front-end should convert to minutes, hours
      days, months, or years.  */
      // to keep things simple and fast, make only 'startTime' and 'endTime' compulsory. You can get the other data from the front-end and update in the future

      // for user with more than 1 session
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
              sessions: preSignUpUser.sessions,
              accessToken: accessToken
            }
          });
        }
      }

      const sessionStatus = `user SESSION IS EXPIRED: new access-token and session for '${preSignUpUser.email}' has been CREATED successfully`;
      //   console.log(tokenStatus);

      req.user = {
        userId: preSignUpUser._id,
        userEmail: preSignUpUser.email!,
        sessionStatus,
        newUserAccessToken: accessToken,
        newUserRefreshToken: refreshToken,
        subSessionActivityId: sub_session_activity_id
      };

      // console.log(req.user);

      next();
    }

    if (error instanceof Error) {
      console.log(error.message);
      // throw new Error(error.message);

      return res.status(500).json({
        responseMessage: 'request unsuccessful, please try again',
        error: error.message
      });
    } else {
      return res.status(500).json({
        responseMessage: 'request unsuccessful, please try again',
        error: error as string
      });
    }
  }

  return;
};

export default authAndSessionsMiddleware;
