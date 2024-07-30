import { fetchAllPlatformUsers } from '../lib/user.fetchAllPlatformUsers.service.js';
const getAllPlatformUsers = async (req, res) => {
    try {
        if (req.user) {
            // const { userId } = req.params;
            const allPlatformUsers = await fetchAllPlatformUsers();
            const { newUserRefreshToken, sessionStatus, newUserAccessToken } = req?.user;
            if (allPlatformUsers && newUserAccessToken) {
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
                        allPlatformUsers,
                        platformUsersCount: allPlatformUsers.length.toString(),
                        sessionStatus,
                        accessToken: newUserAccessToken
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
export default getAllPlatformUsers;
