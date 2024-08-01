import { findPostCategory } from '../../lib/platform.findPostCategory.service.js';
import { findAndUpdatePostCategory } from '../../lib/platform.findAndUpdatePostCategory.service.js';
import { findUser } from '../../../user/lib/user.findUser.service.js';
const updatePostCategory = async (req, res) => {
    if (req.user) {
        const { categoryContentType, categoryId, categoryName } = req.body;
        const { userEmail, sessionStatus, newUserAccessToken, newUserRefreshToken } = req.user;
        try {
            const user = await findUser({ email: userEmail });
            if (!user || user.isAdmin !== true) {
                return res.status(403).json({
                    error: 'request rejected',
                    responseMessage: 'only platform administrators are allowed to perform this action'
                });
            }
            if (!categoryName || !categoryId || !categoryContentType) {
                return res.status(400).json({
                    error: 'required post-category data missing',
                    responseMessage: 'request unsuccessful: please provide all post-category data'
                });
            }
            // console.log(email, name);
            const existingPostCategory = await findPostCategory({ categoryId });
            if (!existingPostCategory) {
                return res.status(400).json({
                    error: 'item not found',
                    responseMessage: `post-category with categoryId: '${categoryId}' not found or does not exist`
                });
            }
            const updatedPostCategory = await findAndUpdatePostCategory({ categoryId: categoryId, requestBody: req.body });
            if (updatedPostCategory && newUserAccessToken) {
                res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none', // Prevent CSRF attacks
                    maxAge: 24 * 60 * 60 * 1000 // 1 day
                });
                return res.status(200).json({
                    responseMessage: 'session activity updated successfully',
                    response: {
                        updatedPostCategory: updatedPostCategory,
                        accessToken: newUserAccessToken,
                        sessionStatus
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
    }
    return;
};
export default updatePostCategory;
