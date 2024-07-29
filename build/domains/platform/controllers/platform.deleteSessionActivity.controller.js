import { deleteSessionActivity } from '../lib/platform.deleteSessionActivity.service.js';
import { findSessionActivity } from '../lib/platform.findSessionActivity.service.js';
const deletePlatformSessionActivity = async (req, res) => {
    const { sessionActivityId } = req.query;
    console.log(sessionActivityId);
    try {
        // if (req.user) {
        const _sessionActivityId = sessionActivityId;
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
    return;
};
export default deletePlatformSessionActivity;
