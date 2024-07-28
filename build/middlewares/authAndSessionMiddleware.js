import jwt from 'jsonwebtoken';
// import { TokenExpiredError } from 'jsonwebtoken';
import {} from 'express';
import { findUser } from '../domains/user/lib/user.findUser.service.js';
import generateTokens from '../utils/generateTokens.js';
import { findAndUpdateUser } from '../domains/user/lib/user.findAndUpdateUser.service.js';
import { findSessionActivity } from '../domains/platform/lib/platform.findSessionActivity.service.js';
const authAndSessionsMiddleware = async (req, res, next) => {
    const requestHeaders = req.headers;
    const { email, authorization, sub_session_activity_id } = requestHeaders;
    const jwtSecret = process.env.JWT_SECRET;
    // console.log(email);
    // console.log(authorization);
    try {
        // console.log('authAndSessionMiddleware started');
        if (sub_session_activity_id.length !== 4) {
            return res.status(403).json({
                error: 'access forbidden',
                responseMessage: `sub_session_activity_id: '${sub_session_activity_id}' is invalid`
            });
        }
        if (!email || !authorization || !sub_session_activity_id) {
            return res.status(403).json({
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
        const user = await findUser({ email });
        // console.log('user', user);
        if (!user) {
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
        const currentSubSessionActivity = (await findSessionActivity({ activityId: sub_session_activity_id }));
        const returnedToken = authorization.split(' ')[1];
        // console.log(returnedToken);
        if (returnedToken && user) {
            const decodedJWT = jwt.verify(returnedToken, jwtSecret);
            // console.log('dJWT', decodedJWT);
            // console.log(decodedJWT.userId);
            // console.log(user._id);
            if (!decodedJWT || decodedJWT.userEmail !== user?.email) {
                return res.status(403).json({
                    error: 'access forbidden',
                    responseMessage: 'user credentials do not match'
                });
            }
            const generatedTokens = await generateTokens({ user });
            const { refreshToken, accessToken } = generatedTokens;
            // console.log(generatedTokens);
            /* proceed to renew user session here: update the 'durationSinceLastSession' field in the current/ongoing session */
            /* session data: 1. startTime(time in milliseconds), 2. endTime("nill or null if being renewed"), 3. UserIPAddress, 4. userLocation,
            5. user's device data(an array of objects - get and add as much as possible), 6. duration since last session - check for previous user session end-time,
            and find the difference between it and the start time of the new session, then save - the front-end should convert to minutes, hours
            days, months, or years.  */
            // to keep things simple and fast, make only 'startTime' and 'endTime' compulsory. You can get the other data from the front-end and update in the future
            // P.S: first user session will be created in the signup controller - hence initial 'durationSinceLastSession' will be = 0
            // update the 'durationSinceLastSession' property of the current user session.
            if (user.sessions && user.sessions.length > 0) {
                // console.log(user.sessions);
                const currentSession = user.sessions[user.sessions.length - 1];
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
                    await findAndUpdateUser({
                        email: user.email,
                        requestBody: {
                            sessions: user.sessions,
                            accessToken: accessToken
                        }
                    });
                }
            }
            // // for user with more than 1 session
            // if (user.sessions && user.sessions.length > 1) {
            //   const currentLastCheckInTime = user?.sessions[user.sessions.length - 1]?.latestCheckInTime;
            //   const currentTimeInMilliseconds = Date.now();
            //   if (latestCheckInTime != undefined) {
            //     const newDurationSinceLastSession = currentTimeInMilliseconds - Number(currentDurationSinceLastSession);
            //     const newCurrentUserSessionObject = {
            //       ...user.sessions[user.sessions.length - 1],
            //       startTime: user.sessions[user.sessions.length - 1]?.startTime as string,
            //       durationSinceLastSession: newDurationSinceLastSession.toString()
            //     };
            //     user.sessions[user.sessions.length - 1] = newCurrentUserSessionObject;
            //     await findAndUpdateUser({
            //       email: user.email,
            //       requestBody: {
            //         sessions: [...user.sessions],
            //         accessToken: accessToken
            //       }
            //     });
            //   }
            // }
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
    }
    catch (error) {
        if (error instanceof Error && error.message === 'jwt expired') {
            /* Access token is expired. Verify token(ignoring expiry) to make sure it's the user,
            then regenerate new tokens(access and refresh) and pass from middleware */
            const user = (await findUser({ email }));
            const currentSubSessionActivity = (await findSessionActivity({ activityId: sub_session_activity_id }));
            // console.log(`catch block ${user}`);
            /* Needed to get user, and perform a DB check afresh so that TS won't complain that user might be undefined, but
           preferred to use the non-null assertion operator to insist that user already exist*/
            // if (!user) {
            //   return res.status(404).json({
            //     error: 'access forbidden',
            //     responseMessage: 'user not found: user does not have access to this route'
            //   });
            // }
            const generatedTokens = await generateTokens({ user });
            const { refreshToken, accessToken } = generatedTokens;
            /* proceed to renew user session here: update the 'durationSinceLastSession' field in the current/ongoing session first, then update the session end time field, and create a new session */
            /* session data: 1. startTime(time in milliseconds), 2. endTime("nill or null if being renewed"), 3. UserIPAddress, 4. userLocation,
            5. user's device data(an array of objects - get and add as much as possible), 6. duration since last session - check for previous user session end-time,
            and find the difference between it and the start time of the new session, then save - the front-end should convert to minutes, hours
            days, months, or years.  */
            // to keep things simple and fast, make only 'startTime' and 'endTime' compulsory. You can get the other data from the front-end and update in the future
            // for user with only a single session
            // if (user.sessions && user.sessions.length == 1 && user.sessions[0]) {
            //   const currentDurationSinceLastSession = user?.sessions[0]?.durationSinceLastSession; // should be = 0 at this point if this is the first time after sign-up
            //   const currentTimeInMilliseconds = Date.now();
            //   if (currentDurationSinceLastSession != undefined) {
            //     const newDurationSinceLastSession = currentTimeInMilliseconds - Number(currentDurationSinceLastSession);
            //     const newCurrentUserSessionObject = {
            //       ...user.sessions[user.sessions.length - 1],
            //       startTime: user.sessions[user.sessions.length - 1]?.startTime as string,
            //       durationSinceLastSession: newDurationSinceLastSession.toString(),
            //       endTime: currentTimeInMilliseconds.toString()
            //     };
            //     user.sessions[user.sessions.length - 1] = newCurrentUserSessionObject;
            //     // create the new array
            //     user.sessions.push({ startTime: currentTimeInMilliseconds.toString() });
            //     findAndUpdateUser({
            //       email: user.email,
            //       requestBody: {
            //         sessions: [...user.sessions],
            //         accessToken: accessToken
            //       }
            //     });
            //     // create the new session
            //   }
            // }
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
                            sessions: user.sessions,
                            accessToken: accessToken
                        }
                    });
                }
            }
            const sessionStatus = `user SESSION IS EXPIRED: new access-token and session for '${user.email}' has been CREATED successfully`;
            //   console.log(tokenStatus);
            req.user = {
                userId: user._id,
                userEmail: user.email,
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
        }
        else {
            return res.status(500).json({
                responseMessage: 'request unsuccessful, please try again',
                error: error
            });
        }
    }
    return;
};
export default authAndSessionsMiddleware;
