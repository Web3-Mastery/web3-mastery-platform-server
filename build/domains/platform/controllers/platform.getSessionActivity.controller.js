import { findSessionActivity } from '../lib/platform.findSessionActivity.service.js';
const getSessionActivity = async (req, res) => {
    try {
        // if (req.user) {
        const { activityId } = req.params;
        const existingSessionActivity = await findSessionActivity({ activityId });
        if (!existingSessionActivity) {
            return res.status(400).json({
                error: 'item not found',
                responseMessage: `session activity with activityId: '${activityId}' not found or does not exist`
            });
        }
        // update refresh token(cookie)
        // res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
        //   httpOnly: true,
        //   secure: true,
        //   sameSite: 'none', // Prevent CSRF attacks
        //   maxAge: 24 * 60 * 60 * 1000 // 1 day
        // });
        return res.status(200).json({
            responseMessage: `user profile fetched successfully`,
            response: {
                sessionActivity: existingSessionActivity
            }
        });
        // }
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
};
export default getSessionActivity;
