import { findUser } from '../lib/user.findUser.service.js';
// import { findAndUpdateUser } from '../lib/user.findAndUpdateUser.service.js';
import { deleteUser } from '../lib/user.deleteUser.service.js';
const deletePersonalProfile = async (req, res) => {
    try {
        if (req.user) {
            console.log(req.user);
            const { userId } = req.params;
            const user = await findUser({ id: userId });
            if (!user) {
                return res.status(404).json({
                    error: 'user error',
                    responseMessage: `user with this Id: 'userId' not found or does not exist`
                });
            }
            if (req.user.userId !== userId) {
                return res.status(403).json({
                    error: 'user error',
                    responseMessage: `user/email provided in request header is not authorized to perform this action for user with id: '${userId}'`
                });
            }
            const deletedUser = await deleteUser({ email: user.email });
            const { newUserRefreshToken, newUserAccessToken, sessionStatus } = req?.user;
            if (deletedUser && deletedUser.acknowledged === true && newUserAccessToken) {
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
                        deletedProfile: user,
                        accessToken: newUserAccessToken,
                        sessionStatus
                    }
                });
            }
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
export default deletePersonalProfile;
