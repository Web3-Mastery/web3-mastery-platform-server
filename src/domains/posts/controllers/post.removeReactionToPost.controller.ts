import type { Request, Response } from 'express';
import type { PostSpecs } from '../schemas/postSchema.zod.js';
import { findPost } from '../lib/post.findPost.service.js';
import { findUser } from '../../user/lib/user.findUser.service.js';
import { findSessionActivity } from '../../platform/lib/sessionActivityManagement/platform.findSessionActivity.service.js';
import { findAndUpdateUser } from '../../user/lib/user.findAndUpdateUser.service.js';
import { findAndUpdatePost } from '../lib/post.findAndUpdatePost.service.js';

/* description: de-creases the post-reaction count and indicates(on the response) 
that the user has removed their reaction from the post */
// request: PATCH
// route: '/api/v1/posts/remove-reaction-to-post:postId";
// access: Public

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    UN_reactedPost: PostSpecs;
    accessToken: string;
    extraData: {
      userHasReacted: boolean;
      userHasBookmarked: boolean;
    };
    sessionStatus?: string;
  };
};

const reactToPost = async (req: Request<{ postId: string }, ResponseSpecs>, res: Response<ResponseSpecs>) => {
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

      if (foundPost && user && currentUserSubSessionActivity && newUserAccessToken && userId && newUserRefreshToken) {
        // increase postReactionCount
        const currentPostReactionCount = foundPost.reactions.reactionsCount;

        const newCurrentPostReactionCount = Number(currentPostReactionCount) - 1;

        // remove user from post reaction list
        const index = foundPost.reactions.reactedUsers?.indexOf({ userId: userId });

        // check if the user exists in the array
        if (index && index !== -1) {
          // Remove the user using splice
          foundPost.reactions.reactedUsers.splice(index, 1);
        }

        // add reacting user to postReactionUsers list => removal instead - done already
        // const newReactedUsersArray = [...foundPost.reactions.reactedUsers, { userId: user._id }];

        const updatedPostData = await findAndUpdatePost({
          postId: postId,
          postData: {
            ...foundPost,
            reactions: {
              reactionsCount: newCurrentPostReactionCount.toString(),
              reactedUsers: foundPost.reactions.reactedUsers
            }
          }
        });

        const bookmarkedUsers = foundPost.bookmarks.bookmarkedUsers;

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

            // const currentSessionId = currentSubSession?.sessionId;

            // const currentTimeInMilliseconds = Date.now();

            const newCurrentSubSessionObject = {
              ...currentSubSession,
              // checkInTime: currentTimeInMilliseconds.toString(),
              subSessionActivity: currentUserSubSessionActivity
              // sessionId: currentSessionId // same id since they are on the same session
            };

            currentSession?.push(newCurrentSubSessionObject);

            await findAndUpdateUser({
              email: user.email,
              requestBody: {
                sessions: user.sessions
                // accessToken: newUserAccessToken
              }
            });

            if (updatedPostData) {
              // needless since we just removed the user
              // const reactedUsers = updatedPostData.reactions.reactedUsers;

              // // check if user has liked this post
              // const hasUserReacted = reactedUsers?.find((each) => {
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
                  UN_reactedPost: updatedPostData,
                  accessToken: newUserAccessToken,
                  extraData: {
                    // userHasReacted: hasUserReacted ? true : false,
                    userHasReacted: false,
                    userHasBookmarked: hasUserBookmarked ? true : false
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

export default reactToPost;
