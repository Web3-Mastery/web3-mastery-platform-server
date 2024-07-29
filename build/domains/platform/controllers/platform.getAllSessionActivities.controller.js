import { fetchAllPlatformSessionActivities } from '../lib/platform.fetchAllSessionActivities.service.js';
// @ts-ignore
const getAllPlatformSessionActivities = async (req, res) => {
    try {
        // if (req.user) {
        const platformSessionActivities = await fetchAllPlatformSessionActivities();
        if (!platformSessionActivities) {
            return res.status(400).json({
                error: 'item not found',
                responseMessage: `could not fetch platform session activity list: list not found of does not exist`
            });
        }
        // update refresh token(cookie)
        // res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
        //   httpOnly: true,
        //   secure: true,
        //   sameSite: 'none', // Prevent CSRF attacks
        //   maxAge: 24 * 60 * 60 * 1000 // 1 day
        // });
        if (platformSessionActivities) {
            return res.status(200).json({
                responseMessage: `user profile fetched successfully`,
                response: {
                    platformSessionActivitiesCount: platformSessionActivities.length,
                    platformSessionActivities: platformSessionActivities
                }
            });
        }
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
export default getAllPlatformSessionActivities;
