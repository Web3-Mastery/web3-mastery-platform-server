import { findJob } from '../lib/jobs.findJob.service.js';
import { deleteJob } from '../lib/job.deleteJob.service.js';
import { findUser } from '../../user/lib/user.findUser.service.js';
import { findSessionActivity } from '../../platform/lib/sessionActivityManagement/platform.findSessionActivity.service.js';
import { findAndUpdateUser } from '../../user/lib/user.findAndUpdateUser.service.js';
const deletePlatformJob = async (req, res) => {
    const { jobId } = req.params;
    if (req.user) {
        try {
            const { userEmail, sessionStatus, newUserAccessToken, newUserRefreshToken, subSessionActivityId: activityId } = req.user;
            const user = await findUser({ email: userEmail });
            const existingJob = await findJob({ jobId });
            if (!existingJob) {
                return res.status(400).json({
                    error: 'process empty',
                    responseMessage: `platform post with postSlug: '${jobId} does not exist or has already been deleted`
                });
            }
            const deletedJob = await deleteJob({ jobId });
            const currentUserSubSessionActivity = await findSessionActivity({ activityId });
            if (currentUserSubSessionActivity &&
                user?.sessions &&
                user?.sessions.length > 0 &&
                deletedJob &&
                existingJob.jobLink &&
                deletedJob.acknowledged === true &&
                newUserAccessToken) {
                // console.log(user.sessions);
                currentUserSubSessionActivity.jobActivityData = {
                    jobTitle: existingJob.jobTitle,
                    jobCategory: existingJob.jobDescription,
                    jobId: existingJob?._id,
                    jobUrl: existingJob?.jobLink && existingJob?.jobLink
                };
                const currentSession = user.sessions[user.sessions.length - 1];
                if (currentSession) {
                    const currentSubSession = currentSession[currentSession.length - 1];
                    // const currentSessionId = currentSubSession?.sessionId;
                    // const currentTimeInMilliseconds = Date.now();
                    const newCurrentSubSessionObject = {
                        ...currentSubSession,
                        //   checkInTime: currentTimeInMilliseconds.toString(),
                        subSessionActivity: currentUserSubSessionActivity
                        // sessionId: currentSessionId // same id since they are on the same session
                    };
                    currentSession[currentSession?.length - 1] = newCurrentSubSessionObject;
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
                        responseMessage: 'post/content was un-registered/deleted successfully',
                        response: {
                            deleteResult: deletedJob,
                            deletedJob: existingJob,
                            accessToken: newUserAccessToken,
                            sessionStatus
                        }
                    });
                }
                return;
            }
            return;
            // }
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
export default deletePlatformJob;
