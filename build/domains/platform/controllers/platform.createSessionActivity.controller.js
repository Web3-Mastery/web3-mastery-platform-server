import { findSessionActivity } from '../lib/platform.findSessionActivity.service.js';
import { createSessionActivity } from '../lib/platform.createSessionActivity.service.js';
const createSessionActivityController = async (req, res) => {
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
        if (existingSessionActivity) {
            return res.status(400).json({
                error: 'duplicate sessionActivity error',
                responseMessage: `a session activity with activityId: '${activityId}' already exist`
            });
        }
        const newSessionActivity = await createSessionActivity({ sessionActivityData: req.body });
        if (newSessionActivity) {
            return res.status(200).json({
                responseMessage: 'session activity created successfully',
                response: {
                    sessionActivity: newSessionActivity
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
export default createSessionActivityController;
