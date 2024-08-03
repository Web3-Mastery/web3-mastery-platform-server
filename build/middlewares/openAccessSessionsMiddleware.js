// import { TokenExpiredError } from 'jsonwebtoken';
import {} from 'express';
import { findSessionActivity } from '../domains/platform/lib/sessionActivityManagement/platform.findSessionActivity.service.js';
import { findPreSignUpUser } from '../domains/user/lib/user.findPreSignUpUser.service.js';
import { findAndUpdatePreSignUpUser } from '../domains/user/lib/user.findAndUpdatePreSignUpUser.service.js';
import { findUser } from '../domains/user/lib/user.findUser.service.js';
import { findAndUpdateUser } from '../domains/user/lib/user.findAndUpdateUser.service.js';
import { updateNewsletterSubscriber } from '../domains/newsletter/lib/newsletter.updateSubscriber.service.js';
import { findNewsletterSubscriber } from '../domains/newsletter/lib/newsletter.findSubscriber.service.js';
/* A middleware that does not check for the refresh token. Basically it is used on the 'login' and 'start-signup' end-points
One of it's core purpose is to create/start sessions */
// @ts-ignore
const openAccessSessionsMiddleware = async (req, res, next) => {
    try {
        const requestHeaders = req.headers;
        const { email: emailFromRequestBody } = req.body;
        const { email, sub_session_activity_id } = requestHeaders;
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
        const newsletterSubscriber = await findNewsletterSubscriber({ email });
        // console.log(newsLetterSubscriber);
        if (!sub_session_activity_id || !email) {
            return res.status(401).json({
                error: 'access forbidden',
                responseMessage: `request header data missing or is not provided: 'email' and 'sub_session_activity_id' 
        must be provided as request header data`
            });
        }
        // console.log('user', user);
        const currentSubSessionActivity = (await findSessionActivity({ activityId: sub_session_activity_id }));
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
        if (newsletterSubscriber && newsletterSubscriber.isVerified == true) {
            if (newsletterSubscriber.sessions && newsletterSubscriber.sessions.length > 0) {
                // console.log(newsletterSubscriber.sessions);
                const currentSession = newsletterSubscriber.sessions[newsletterSubscriber.sessions.length - 1];
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
                    newsletterSubscriber.sessions?.push([newCurrentSubSessionObject]);
                    await updateNewsletterSubscriber({
                        email: newsletterSubscriber.email,
                        requestBody: {
                            ...newsletterSubscriber,
                            sessions: newsletterSubscriber.sessions
                        }
                    });
                }
            }
        }
        req.user = {
            userEmail: email,
            subSessionActivityId: sub_session_activity_id
        };
        // proceed to next middleware or route
        next();
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            throw new Error(error.message);
        }
        else {
            console.log(error);
            throw new Error('An error occurred');
        }
    }
};
export default openAccessSessionsMiddleware;
