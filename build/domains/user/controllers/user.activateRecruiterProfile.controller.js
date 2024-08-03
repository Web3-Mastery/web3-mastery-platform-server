import { findUser } from '../lib/user.findUser.service.js';
import { findAndUpdateUser } from '../lib/user.findAndUpdateUser.service.js';
const getUserProfileData = async (req, res) => {
    try {
        if (req.user) {
            const { userId } = req.params;
            const user = await findUser({ id: userId });
            if (!user) {
                return res.status(404).json({
                    error: 'user error',
                    responseMessage: `user with this Id: '${userId}' not found or does not exist`
                });
            }
            const recruiterActivatedUser = await findAndUpdateUser({
                id: userId,
                requestBody: {
                    ...user,
                    isRecruiterEnabled: true
                }
            });
            const { newUserRefreshToken, sessionStatus } = req?.user;
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
                    userWithRecruiterProfile: recruiterActivatedUser,
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
};
export default getUserProfileData;
