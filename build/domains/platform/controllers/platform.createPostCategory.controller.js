import { findPostCategory } from '../lib/platform.findPostCategory.service.js';
import { findUser } from '../../user/lib/user.findUser.service.js';
import { createPostCategory } from '../lib/platform.createPostCategory.service.js';
const updatePlatformPost = async (req, res) => {
    if (req.user) {
        try {
            const { userEmail, sessionStatus, newUserAccessToken, newUserRefreshToken } = req.user;
            const { categoryId } = req.body;
            const user = await findUser({ email: userEmail });
            if (!user || user.isAdmin !== true) {
                return res.status(403).json({
                    error: 'request rejected',
                    responseMessage: 'only platform administrators are allowed to perform this action'
                });
            }
            const existingPostCategory = await findPostCategory({ categoryId });
            if (existingPostCategory) {
                return res.status(400).json({
                    error: 'duplicate post category detected',
                    responseMessage: `request unsuccessful: a post category with categoryId: '${categoryId}' already exist`
                });
            }
            const newPostCategory = await createPostCategory({ postCategoryData: req.body });
            if (newPostCategory && newUserAccessToken) {
                res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none', // Prevent CSRF attacks
                    maxAge: 24 * 60 * 60 * 1000 // 1 day
                });
                return res.status(200).json({
                    responseMessage: 'post category created successfully',
                    response: {
                        postCategory: newPostCategory,
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
    // }
    return;
};
export default updatePlatformPost;
