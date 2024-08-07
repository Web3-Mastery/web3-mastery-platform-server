import { findPost } from '../lib/post.findPost.service.js';
import { createPost } from '../lib/post.createPost.service.js';
const registerPost = async (req, res) => {
    const { postSlug } = req.body;
    if (req.user) {
        try {
            const { sessionStatus, newUserAccessToken, newUserRefreshToken } = req.user;
            /* No need for a similar check as below, due to too much data: Zod and Mongoose will handle that. Ensure that both the Zod and
            Mongoose Schemas are strictly verified/confirmed to block incomplete or error submissions since there is no extra check here. */
            // if (!postTitle || !postSlug || !postBrief) {
            //   return res.status(400).json({
            //     error: 'required activity input missing',
            //     responseMessage: 'request unsuccessful: please provide all activity data'
            //   });
            // }
            const existingPost = await findPost({ postSlug: postSlug });
            if (existingPost) {
                return res.status(400).json({
                    error: 'duplicate-post-detected',
                    responseMessage: `request unsuccessful: a post with postSlug: '${postSlug}' already exist`
                });
            }
            const registeredPost = await createPost({ postData: req.body });
            if (registeredPost && newUserAccessToken) {
                res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none', // Prevent CSRF attacks
                    maxAge: 24 * 60 * 60 * 1000 // 1 day
                });
                return res.status(201).json({
                    responseMessage: 'post registered/created successfully',
                    response: {
                        registeredPost,
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
export default registerPost;
