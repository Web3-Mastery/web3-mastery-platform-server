import { findPost } from '../lib/post.findPost.service.js';
import { findUser } from '../../user/lib/user.findUser.service.js';
import { findSessionActivity } from '../../platform/lib/platform.findSessionActivity.service.js';
import { findAndUpdateUser } from '../../user/lib/user.findAndUpdateUser.service.js';
const getPost = async (req, res) => {
    if (req.user) {
        try {
            const { postSlug } = req.body;
            const { subSessionActivityId: activityId, sessionStatus, userEmail, userId, newUserAccessToken, newUserRefreshToken } = req.user;
            const foundPost = await findPost({ postSlug });
            const user = await findUser({ email: userEmail });
            if (!user) {
                return res.status(403).json({
                    error: 'request rejected',
                    responseMessage: `user with id: '${userId}' not found or does not exist`
                });
            }
            if (!foundPost) {
                return res.status(400).json({
                    error: 'item not found',
                    responseMessage: `requested post with postSlug: '${postSlug}' not found or does not exist`
                });
            }
            // get current user activity
            const currentUserSubSessionActivity = await findSessionActivity({ activityId });
            const reactedUsers = foundPost.reactions.reactedUsers;
            const bookmarkedUsers = foundPost.bookmarks.bookmarkedUsers;
            if (currentUserSubSessionActivity && newUserAccessToken && userId && newUserRefreshToken) {
                // check if user has liked this post
                const hasUserReacted = reactedUsers?.find((each) => {
                    return (each.userId = userId);
                });
                // check if user has bookmarked this post
                const hasUserBookmarked = bookmarkedUsers?.find((each) => {
                    return (each.userId = userId);
                });
                currentUserSubSessionActivity.contentActivityData = {
                    contentType: 'article',
                    contentTitle: foundPost.postTitle,
                    contentId: foundPost._id && foundPost._id,
                    contentUrl: foundPost.postLink
                };
                if (user?.sessions && user?.sessions.length > 0) {
                    // console.log(user.sessions);
                    const currentSession = user.sessions[user.sessions.length - 1];
                    if (currentSession) {
                        const currentSubSession = currentSession[currentSession.length - 1];
                        const currentSessionId = currentSubSession?.sessionId;
                        const currentTimeInMilliseconds = Date.now();
                        const newCurrentSubSessionObject = {
                            checkInTime: currentTimeInMilliseconds.toString(),
                            subSessionActivity: currentUserSubSessionActivity,
                            sessionId: currentSessionId // same id since they are on the same session
                        };
                        currentSession?.push(newCurrentSubSessionObject);
                        await findAndUpdateUser({
                            email: user.email,
                            requestBody: {
                                sessions: user.sessions,
                                accessToken: newUserAccessToken
                            }
                        });
                        res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
                            httpOnly: true,
                            secure: true,
                            sameSite: 'none', // Prevent CSRF attacks
                            maxAge: 24 * 60 * 60 * 1000 // 1 day
                        });
                        return res.status(200).json({
                            responseMessage: `user profile fetched successfully`,
                            response: {
                                fetchedPost: foundPost,
                                accessToken: newUserAccessToken,
                                extraData: {
                                    userHasReacted: hasUserReacted ? true : false,
                                    userHasBookmarked: hasUserBookmarked ? true : false
                                },
                                sessionStatus: sessionStatus
                            }
                        });
                    }
                    return;
                }
                return;
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
export default getPost;
