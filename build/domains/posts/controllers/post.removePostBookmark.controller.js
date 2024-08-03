import { findUser } from '../../user/lib/user.findUser.service.js';
import { findSessionActivity } from '../../platform/lib/sessionActivityManagement/platform.findSessionActivity.service.js';
import { findAndUpdateUser } from '../../user/lib/user.findAndUpdateUser.service.js';
import { findPost } from '../lib/post.findPost.service.js';
import { findAndUpdatePost } from '../lib/post.findAndUpdatePost.service.js';
const bookmarkJob = async (req, res) => {
    if (req.user) {
        try {
            // const { postSlug } = req.query;
            // const stringedPostSlug = postSlug as string;
            const { postId } = req.params;
            // const postSlug =
            const { subSessionActivityId: activityId, sessionStatus, userEmail, userId, newUserAccessToken, newUserRefreshToken } = req.user;
            const user = await findUser({ email: userEmail });
            const existingPost = await findPost({ postId: postId });
            if (!existingPost) {
                return res.status(400).json({
                    error: 'item not found',
                    responseMessage: `requested post with postId: '${postId}' not found or does not exist`
                });
            }
            // get current user activity
            const currentUserSubSessionActivity = await findSessionActivity({ activityId });
            if (existingPost && existingPost.postLink && user && currentUserSubSessionActivity && newUserAccessToken && userId && newUserRefreshToken) {
                const currentNumberOfPostBookmarks = existingPost.bookmarks.bookmarksCount;
                const newCurrentNumberOfPostBookmarks = Number(currentNumberOfPostBookmarks) - 1;
                const postBookmarkedUsersArray = existingPost.bookmarks.bookmarkedUsers;
                const index = postBookmarkedUsersArray.indexOf({ userId: userId });
                // Check if the item exists in the array
                if (index !== -1) {
                    // Remove the item using splice
                    postBookmarkedUsersArray.splice(index, 1);
                }
                // update job data
                // add bookmarking user to postBookmarkUsers list
                // const newBookmarkUsersArray = [...existingJob.bookmarks.bookmarkedUsers, { userId: user._id }];
                // I supposed this also works => // const newBookmarkUsersArray = existingJob.bookmarks.bookmarkedUsers.push(existingJob)
                const updatedPostData = await findAndUpdatePost({
                    postId: postId,
                    postData: {
                        ...existingPost,
                        bookmarks: {
                            bookmarksCount: newCurrentNumberOfPostBookmarks.toString(),
                            bookmarkedUsers: postBookmarkedUsersArray
                        }
                    }
                });
                // const updatedUserData = await findAndUpdateUser({
                //   email: userEmail,
                //   requestBody: {
                //     savedJobs: user.savedJobs
                //   }
                // });
                // equally unnecessary as in the post case - cos we just added the user to the list as shown above
                // const bookmarkedUsers = existingJob.bookmarks.bookmarkedUsers;
                // // check if user has bookmarked this post
                // const hasUserBookmarked = bookmarkedUsers?.find((each) => {
                //   return (each.userId = userId);
                // });
                currentUserSubSessionActivity.contentActivityData = {
                    contentType: 'article',
                    contentTitle: existingPost.postTitle,
                    contentId: existingPost._id && existingPost._id,
                    contentUrl: existingPost.postLink
                };
                if (user?.sessions && user?.sessions.length > 0) {
                    // console.log(user.sessions);
                    const currentSession = user.sessions[user.sessions.length - 1];
                    if (currentSession) {
                        const currentSubSession = currentSession[currentSession.length - 1];
                        // const currentSessionId = currentSubSession?.sessionId;
                        // const currentTimeInMilliseconds = Date.now();
                        const newCurrentSubSessionObject = {
                            ...currentSubSession,
                            //   checkInTime: currentTimeInMilliseconds.toString(),
                            subSessionActivity: currentUserSubSessionActivity
                            // sessionId: currentSessionId // same id since they are on the same session
                        };
                        currentSession[currentSession?.length - 1] = newCurrentSubSessionObject;
                        // remove existing job from user's bookmarked-jobs list
                        const index = user?.bookMarks?.indexOf(existingPost);
                        // Check if the item exists in the array
                        if (index && index !== -1) {
                            // Remove the item using splice
                            user?.bookMarks?.splice(index, 1);
                        }
                        await findAndUpdateUser({
                            email: user.email,
                            requestBody: {
                                sessions: user.sessions,
                                bookMarks: user.bookMarks
                                // accessToken: newUserAccessToken
                            }
                        });
                        if (updatedPostData) {
                            const reactedUsers = updatedPostData.reactions.reactedUsers;
                            // check if user has liked this post
                            const hasUserReacted = reactedUsers?.find((each) => {
                                return (each.userId = userId);
                            });
                            // there is not reacting to jobs - but leave code for now - might need later
                            // const bookmarkedUsers = updatedPostData.reactions.reactedUsers;
                            // // check if user has liked this post
                            // const hasUserReacted = bookmarkedUsers?.find((each) => {
                            //   return (each.userId = userId);
                            // });
                            res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
                                httpOnly: true,
                                secure: true,
                                sameSite: 'none', // Prevent CSRF attacks
                                maxAge: 24 * 60 * 60 * 1000 // 1 day
                            });
                            return res.status(200).json({
                                responseMessage: `user profile fetched successfully`,
                                response: {
                                    UN_bookmarkedPost: updatedPostData,
                                    accessToken: newUserAccessToken,
                                    extraData: {
                                        userHasReacted: hasUserReacted ? true : false,
                                        userHasBookmarked: false
                                        // userHasBookmarked: hasUserBookmarked ? true : false // straight-up true cos we just added the user as seen above
                                    },
                                    sessionStatus: sessionStatus
                                }
                            });
                        }
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
export default bookmarkJob;
