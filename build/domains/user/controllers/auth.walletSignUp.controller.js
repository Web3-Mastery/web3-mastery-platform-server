// import nodemailer from 'nodemailer';
import { findUser } from '../lib/user.findUser.service.js';
import generateTokens from '../../../utils/generateTokens.js';
// import { findPreSignUpUser } from '../lib/user.findPreSignUpUser.service.js';
import { createPreSignUpUser } from '../lib/auth.createPreSignUpUser.service.js';
// import { findAndUpdatePreSignUpUser } from '../lib/user.findAndUpdatePreSignUpUser.service.js';
// import { deletePreSignUpUser } from '../lib/user.deletePreSignUpUser.service.js';
import { findSessionActivity } from '../../platform/lib/sessionActivityManagement/platform.findSessionActivity.service.js';
import { findAndUpdateUser } from '../lib/user.findAndUpdateUser.service.js';
const walletSignUp = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                error: 'request rejected',
                responseMessage: `access to request headers impossible: please provide access to request headers`
            });
        }
        const { subSessionActivityId: sub_session_activity_id } = req.user;
        if (!sub_session_activity_id) {
            return res.status(401).json({
                error: 'access forbidden',
                responseMessage: `request header data missing or is not provided: 'email' and 'sub_session_activity_id' must be provided as request header data`
            });
        }
        const { walletAddress } = req.body;
        // if (req.user) {
        if (walletAddress) {
            return res.status(400).json({
                error: 'required user input missing',
                responseMessage: 'wallet address not provided'
            });
        }
        // console.log(email, name);
        const existingUser = await findUser({ walletAddress });
        if (existingUser) {
            return res.status(400).json({
                error: 'duplicate user error',
                responseMessage: `a user account with walletAddress: '${walletAddress}' already exist, please login to your account instead`
            });
        }
        // check and remove(if correct) since this below is already being set in the open-access middleware
        const subSessionActivity = (await findSessionActivity({ activityId: sub_session_activity_id }));
        // console.log(subSessionActivity);
        const newWalletUser = await createPreSignUpUser({
            user: {
                walletAddress: walletAddress,
                signedUpWithWallet: true,
                // secretSignUpToken: signUpToken as string,
                sessions: [[{ checkInTime: '0', subSessionActivity: subSessionActivity, sessionId: '1' }]]
            }
        });
        // generate tokens, pass access token, and set refresh token
        const generatedTokens = await generateTokens({ user: newWalletUser });
        const { refreshToken, accessToken } = generatedTokens;
        if (newWalletUser && newWalletUser.walletAddress) {
            // we needed to get the user with id first before we could generate the tokens(as done above) hence re-updating the user as below
            const newWalletUserWithAccessToken = await findAndUpdateUser({
                walletAddress: newWalletUser.walletAddress,
                requestBody: { ...newWalletUser, signUpStatus: 'sign-up-completed', accessToken }
            });
            // set refresh token as cookie for authorization purposes
            res.cookie('Web3Mastery_SecretRefreshToken', refreshToken, {
                // domain: 'localhost',
                // path: '/',
                httpOnly: true,
                secure: true, // prevents "man-in-the-middle" attacks
                sameSite: 'strict', // Prevent CSRF attacks
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });
            return res.status(201).json({
                responseMessage: `wallet sign-up completed successfully`,
                response: { walletUser: newWalletUserWithAccessToken }
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
    return;
};
// }
export default walletSignUp;
