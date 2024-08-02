import { findJobCategory } from '../../lib/jobCategoryManagement/platform.findJobCategory.service.js';
import { deleteJobCategory } from '../../lib/jobCategoryManagement/platform.deleteJobCategory.service.js';
import { findUser } from '../../../user/lib/user.findUser.service.js';
const deletePlatformjobCategory = async (req, res) => {
    if (req.user) {
        const { jobCategoryId } = req.query;
        const _categoryId = jobCategoryId;
        try {
            const { userEmail, sessionStatus, newUserAccessToken, newUserRefreshToken } = req.user;
            const user = await findUser({ email: userEmail });
            if (!user || user.isAdmin !== true) {
                return res.status(403).json({
                    error: 'request rejected',
                    responseMessage: 'only platform administrators are allowed to perform this action'
                });
            }
            const existingJobCategory = await findJobCategory({ categoryId: _categoryId });
            // console.log(existingSessionActivity);
            if (!existingJobCategory) {
                return res.status(400).json({
                    error: 'process empty',
                    responseMessage: `job-category with categoryId: '${_categoryId}' does not exist or has already been deleted`
                });
            }
            const deletedResponse = await deleteJobCategory({ categoryId: _categoryId });
            if (deletedResponse && deletedResponse.acknowledged === true && newUserAccessToken && newUserRefreshToken) {
                //  update refresh token(cookie)
                res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none', // Prevent CSRF attacks
                    maxAge: 24 * 60 * 60 * 1000 // 1 day
                });
                return res.status(201).json({
                    responseMessage: 'job-category deleted successfully',
                    response: {
                        deleteResult: deletedResponse,
                        deletedJobCategory: existingJobCategory,
                        accessToken: newUserAccessToken,
                        sessionStatus
                    }
                });
            }
            return;
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
export default deletePlatformjobCategory;
