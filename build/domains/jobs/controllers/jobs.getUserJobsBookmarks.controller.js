import { findAllJobs } from '../lib/jobs.findAllJobs.service.js';
const getUserJobsBookmarks = async (req, res) => {
    if (req.user) {
        try {
            const { sessionStatus, userId, newUserAccessToken, newUserRefreshToken } = req.user;
            const allPosts = await findAllJobs();
            // Filter posts bookmarked by the given user
            const userJobsBookmarks = allPosts.filter((job) => job.bookmarks.bookmarkedUsers.some((bookmark) => bookmark.userId.toString() === userId));
            if (userJobsBookmarks && newUserAccessToken && userId && newUserRefreshToken) {
                res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none', // Prevent CSRF attacks
                    maxAge: 24 * 60 * 60 * 1000 // 1 day
                });
                return res.status(200).json({
                    responseMessage: `user profile fetched successfully`,
                    response: {
                        fetchedUserBookmarks: userJobsBookmarks,
                        userBookmarksCount: String(userJobsBookmarks.length),
                        accessToken: newUserAccessToken,
                        sessionStatus: sessionStatus
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
    }
    return;
};
export default getUserJobsBookmarks;
