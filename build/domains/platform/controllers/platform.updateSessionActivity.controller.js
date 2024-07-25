import { findSessionActivity } from '../lib/platform.findSessionActivity.service.js';
import { findAndUpdateSessionActivity } from '../lib/findAndUpdateSessionActivity.service.js';
const updateSessionActivityController = async (req, res) => {
    const { activityName, activityDescription, activityId } = req.body;
    try {
        // if (req.user) {
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
        if (foundSessionActivity) {
            return res.status(200).json({
                responseMessage: 'session activity updated successfully',
                response: {
                    sessionActivity: foundSessionActivity
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
    // }
    return;
};
export default updateSessionActivityController;
