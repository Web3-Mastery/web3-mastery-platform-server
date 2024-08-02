import { findSessionActivity } from '../../lib/sessionActivityManagement/platform.findSessionActivity.service.js';
import { findUser } from '../../../user/lib/user.findUser.service.js';
const getSessionActivity = async (req, res) => {
    if (req.user) {
        try {
            const { activityId } = req.params;
            const { userEmail, sessionStatus, newUserAccessToken, newUserRefreshToken } = req.user;
            const user = await findUser({ email: userEmail });
            if (!user || user.isAdmin !== true) {
                return res.status(403).json({
                    error: 'request rejected',
                    responseMessage: 'only platform administrators are allowed to perform this action'
                });
            }
            const existingSessionActivity = await findSessionActivity({ activityId });
            if (!existingSessionActivity) {
                return res.status(400).json({
                    error: 'item not found',
                    responseMessage: `session activity with activityId: '${activityId}' not found or does not exist`
                });
            }
            if (existingSessionActivity && newUserAccessToken) {
                // update refresh token(cookie)
                res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none', // Prevent CSRF attacks
                    maxAge: 24 * 60 * 60 * 1000 // 1 day
                });
                return res.status(200).json({
                    responseMessage: `user profile fetched successfully`,
                    response: {
                        sessionActivity: existingSessionActivity,
                        accessToken: newUserAccessToken,
                        sessionStatus
                    }
                });
            }
            return;
        }
        catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({
                    responseMessage: 'request was unsuccessful',
                    error: error.message
                });
            }
            else {
                return res.status(500).json({
                    responseMessage: 'request was unsuccessful: please try again',
                    error: error
                });
            }
        }
    }
    return;
};
export default getSessionActivity;
