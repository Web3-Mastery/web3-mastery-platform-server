import type { Request, Response } from 'express';
import type { PostSpecs } from '../schemas/postSchema.zod.js';
import { findPost } from '../lib/post.findPost.service.js';
import { findUser } from '../../user/lib/user.findUser.service.js';
import { findSessionActivity } from '../../platform/lib/sessionActivityManagement/platform.findSessionActivity.service.js';
import { findAndUpdateUser } from '../../user/lib/user.findAndUpdateUser.service.js';
import { findAndUpdatePost } from '../lib/post.findAndUpdatePost.service.js';

// description: increases the post-bookmark count and indicates(on the response) that the user has bookmarked the post
// request: PATCH
// route: '/api/v1/posts/bookmark-post/:postId";
// access: Public

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    bookmarkedPost: PostSpecs;
    accessToken: string;
    extraData: {
      userHasReacted: boolean;
      userHasBookmarked: boolean;
    };
    sessionStatus?: string;
  };
};

const bookmarkPost = async (req: Request<{ postId: string }, ResponseSpecs>, res: Response<ResponseSpecs>) => {
  if (req.user) {
    try {
      const { postId } = req.params;
      const { subSessionActivityId: activityId, sessionStatus, userEmail, userId, newUserAccessToken, newUserRefreshToken } = req.user;

      const foundPost = await findPost({ postId });

      const user = await findUser({ email: userEmail });

      if (!foundPost) {
        return res.status(400).json({
          error: 'item not found',
          responseMessage: `requested post with postId: '${postId}' not found or does not exist`
        });
      }

      // get current user activity
      const currentUserSubSessionActivity = await findSessionActivity({ activityId });

      if (foundPost && foundPost.postLink && user && currentUserSubSessionActivity && newUserAccessToken && userId && newUserRefreshToken) {
        // increase postBookmarkCount
        const currentPostBookmarkCount = foundPost.bookmarks.bookmarksCount;

        const newCurrentPostBookmarkCount = Number(currentPostBookmarkCount) + 1;

        // add bookmarking user to postBookmarkUsers list
        const newBookmarkUsersArray = [...foundPost.bookmarks.bookmarkedUsers, { userId: user._id }];

        const updatedPostData = await findAndUpdatePost({
          postId: postId,
          postData: {
            ...foundPost,
            bookmarks: {
              bookmarksCount: newCurrentPostBookmarkCount.toString(),
              bookmarkedUsers: newBookmarkUsersArray
            }
          }
        });

        // we're adding the user to the list just now, so the below commented section does not make complete sense
        // const bookmarkedUsers = foundPost.bookmarks.bookmarkedUsers;

        // // check if user has bookmarked this post
        // const hasUserBookmarked = bookmarkedUsers?.find((each) => {
        //   return (each.userId = userId);
        // });

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

            // const currentSessionId = currentSubSession?.sessionId;

            // const currentTimeInMilliseconds = Date.now();

            const newCurrentSubSessionObject = {
              ...currentSubSession,
              // checkInTime: currentTimeInMilliseconds.toString(),
              subSessionActivity: currentUserSubSessionActivity
              // sessionId: currentSessionId // same id since they are on the same session
            };

            currentSession?.push(newCurrentSubSessionObject);

            // add existing job to user's bookmarked-posts list
            user?.bookMarks?.push(foundPost);

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

              res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'none', // Prevent CSRF attacks
                maxAge: 24 * 60 * 60 * 1000 // 1 day
              });

              return res.status(200).json({
                responseMessage: `user profile fetched successfully`,
                response: {
                  bookmarkedPost: updatedPostData,
                  accessToken: newUserAccessToken,
                  extraData: {
                    userHasReacted: hasUserReacted ? true : false,
                    userHasBookmarked: true // automatically true because we just added the user to the bookmark list
                    // userHasBookmarked: hasUserBookmarked ? true : false
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
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          responseMessage: 'request was unsuccessful',
          error: error.message
        });
      } else {
        return res.status(500).json({
          responseMessage: 'request was unsuccessful: please try again',
          error: error as string
        });
      }
    }
  }

  return;
};

export default bookmarkPost;
