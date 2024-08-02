// import { findJob } from '../lib/jobs.findJob.service.js';
import { createJob } from '../lib/job.createJob.service.js';
import { findUser } from '../../user/lib/user.findUser.service.js';
import { findSessionActivity } from '../../platform/lib/sessionActivityManagement/platform.findSessionActivity.service.js';
import { findAndUpdateUser } from '../../user/lib/user.findAndUpdateUser.service.js';
const registerJob = async (req, res) => {
    if (req.user) {
        try {
            const { userEmail, sessionStatus, newUserAccessToken, newUserRefreshToken, subSessionActivityId: activityId } = req.user;
            const user = await findUser({ email: userEmail });
            const registeredJob = await createJob({ jobData: req.body });
            // get current user activity
            const currentUserSubSessionActivity = await findSessionActivity({ activityId });
            if (user?.sessions &&
                user?.sessions.length > 0 &&
                registeredJob &&
                registeredJob.jobLink &&
                newUserAccessToken &&
                currentUserSubSessionActivity) {
                currentUserSubSessionActivity.jobActivityData = {
                    jobTitle: registeredJob.jobTitle,
                    jobCategory: registeredJob.jobDescription,
                    jobId: registeredJob?._id,
                    jobUrl: registeredJob?.jobLink && registeredJob?.jobLink
                };
                // console.log(user.sessions);
                const currentSession = user.sessions[user.sessions.length - 1];
                if (currentSession) {
                    // const currentSubSession = currentSession[currentSession.length - 1];
                    // const currentSessionId = currentSubSession?.sessionId;
                    // const currentTimeInMilliseconds = Date.now();
                    const newCurrentSubSessionObject = {
                        // checkInTime: currentTimeInMilliseconds.toString(),
                        subSessionActivity: currentUserSubSessionActivity
                        // sessionId: currentSessionId // same id since they are on the same session
                    };
                    currentSession?.push(newCurrentSubSessionObject);
                    await findAndUpdateUser({
                        email: user.email,
                        requestBody: {
                            sessions: user.sessions
                            // accessToken: newUserAccessToken
                        }
                    });
                    res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'none', // Prevent CSRF attacks
                        maxAge: 24 * 60 * 60 * 1000 // 1 day
                    });
                    return res.status(201).json({
                        responseMessage: 'job registered/created successfully',
                        response: {
                            createdJob: registeredJob,
                            accessToken: newUserAccessToken,
                            sessionStatus
                        }
                    });
                }
                return;
            }
            return;
        }
        catch (error) {
            if (error instanceof Error) {
                console.log(error);
                const errorString = error.message;
                return res.status(500).json({
                    responseMessage: 'process error',
                    error: errorString
                });
            }
            else {
                console.log(error);
                return res.status(500).json({
                    responseMessage: 'process error: please try again',
                    error: error
                });
            }
        }
    }
    // }
    return;
};
export default registerJob;
