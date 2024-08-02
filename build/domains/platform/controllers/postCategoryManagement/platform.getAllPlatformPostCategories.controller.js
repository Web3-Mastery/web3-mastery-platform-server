import { fetchAllPostCategories } from '../../lib/postCategoryManagement/platform.fetchAllPostCategories.service.js';
import { findUser } from '../../../user/lib/user.findUser.service.js';
// @ts-ignore
const getAllPlatformPostCategories = async (req, res) => {
    if (req.user) {
        const { userEmail, sessionStatus, newUserAccessToken, newUserRefreshToken } = req.user;
        try {
            const user = await findUser({ email: userEmail });
            if (!user || user.isAdmin !== true) {
                return res.status(403).json({
                    error: 'request rejected',
                    responseMessage: 'only platform administrators are allowed to perform this action'
                });
            }
            const platformPostCategories = await fetchAllPostCategories();
            if (!platformPostCategories) {
                return res.status(400).json({
                    error: 'item not found',
                    responseMessage: `could not fetch platform post categories list: list not found of does not exist`
                });
            }
            // update refresh token(cookie)
            // res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
            //   httpOnly: true,
            //   secure: true,
            //   sameSite: 'none', // Prevent CSRF attacks
            //   maxAge: 24 * 60 * 60 * 1000 // 1 day
            // });
            if (platformPostCategories && newUserAccessToken && sessionStatus) {
                //  update refresh token(cookie)
                res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none', // Prevent CSRF attacks
                    maxAge: 24 * 60 * 60 * 1000 // 1 day
                });
                return res.status(200).json({
                    responseMessage: `user profile fetched successfully`,
                    response: {
                        platformPostCategoriesCount: platformPostCategories.length,
                        platformPostCategories: platformPostCategories,
                        accessToken: newUserAccessToken,
                        sessionStatus: sessionStatus
                    }
                });
            }
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
};
export default getAllPlatformPostCategories;
