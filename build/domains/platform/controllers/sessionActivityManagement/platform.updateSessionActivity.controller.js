import { findSessionActivity } from '../../lib/sessionActivityManagement/platform.findSessionActivity.service.js';
import { findAndUpdateSessionActivity } from '../../lib/sessionActivityManagement/platform.findAndUpdateSessionActivity.service.js';
import { findUser } from '../../../user/lib/user.findUser.service.js';
const updateSessionActivityController = async (req, res) => {
    if (req.user) {
        try {
            const { activityName, activityDescription, activityId } = req.body;
            const { userEmail, sessionStatus, newUserAccessToken, newUserRefreshToken } = req.user;
            const user = await findUser({ email: userEmail });
            if (!user || user.isAdmin !== true) {
                return res.status(403).json({
                    error: 'request rejected',
                    responseMessage: 'only platform administrators are allowed to perform this action'
                });
            }
            if (!activityName || !activityDescription || !activityId) {
                return res.status(400).json({
                    error: 'required activity input missing',
                    responseMessage: 'request unsuccessful: please provide all activity data'
                });
            }
            // console.log(email, name);
            const existingSessionActivity = await findSessionActivity({ activityId });
            if (!existingSessionActivity) {
                return res.status(400).json({
                    error: 'item not found',
                    responseMessage: `session activity with activityId: '${activityId}' not found or does not exist`
                });
            }
            const foundSessionActivity = await findAndUpdateSessionActivity({ activityId: activityId, requestBody: req.body });
            if (foundSessionActivity && newUserAccessToken) {
                res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none', // Prevent CSRF attacks
                    maxAge: 24 * 60 * 60 * 1000 // 1 day
                });
                return res.status(200).json({
                    responseMessage: 'session activity updated successfully',
                    response: {
                        sessionActivity: foundSessionActivity,
                        accessToken: newUserAccessToken,
                        sessionStatus
                    }
                });
            }
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
    return;
};
export default updateSessionActivityController;
