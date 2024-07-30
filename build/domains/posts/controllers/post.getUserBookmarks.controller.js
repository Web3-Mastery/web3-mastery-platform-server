import { findAllPosts } from '../lib/post.findAllPosts.service.js';
const getUserBookmarks = async (req, res) => {
    if (req.user) {
        try {
            const { sessionStatus, userId, newUserAccessToken, newUserRefreshToken } = req.user;
            const allPosts = await findAllPosts();
            // Filter posts bookmarked by the given user
            const userBookmarks = allPosts.filter((post) => post.bookmarks.bookmarkedUsers.some((bookmark) => bookmark.userId.toString() === userId));
            if (userBookmarks && newUserAccessToken && userId && newUserRefreshToken) {
                res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none', // Prevent CSRF attacks
                    maxAge: 24 * 60 * 60 * 1000 // 1 day
                });
                return res.status(200).json({
                    responseMessage: `user profile fetched successfully`,
                    response: {
                        fetchedUserBookmarks: userBookmarks,
                        userBookmarksCount: String(userBookmarks.length),
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
export default getUserBookmarks;
