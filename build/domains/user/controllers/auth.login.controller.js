import { validatePasswordWithRegex } from '../../../utils/validatePasswordWithRegex.js';
import { findUser } from '../lib/user.findUser.service.js';
import decryptHandler from '../../../utils/decryptHandler.js';
import generateTokens from '../../../utils/generateTokens.js';
import { findAndUpdateUser } from '../lib/user.findAndUpdateUser.service.js';
// type RequestHeaderContentSpecs = {
//   authorization: string;
//   email: string;
//   sub_session_activity_id: string;
// };
const loginUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                error: 'request rejected',
                responseMessage: `access to request headers impossible: please provide access to request headers`
            });
        }
        const { subSessionActivityId: sub_session_activity_id } = req.user;
        // console.log(sub_session_activity_id);
        if (!sub_session_activity_id) {
            return res.status(401).json({
                error: 'access forbidden',
                responseMessage: `request header data missing or is not provided: 'email' and 'sub_session_activity_id' must be provided as request header data`
            });
        }
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                error: 'access denied',
                responseMessage: 'user input missing: please provide all input fields'
            });
        }
        const passwordValidationResponse = validatePasswordWithRegex(password);
        if (!passwordValidationResponse) {
            return res.status(400).json({
                error: 'request rejected',
                responseMessage: 'password does not match regex specifications'
            });
        }
        //check if user exists
        const user = await findUser({ email });
        // console.log(user);
        if (!user) {
            return res.status(404).json({
                error: 'access denied',
                responseMessage: 'request unsuccessful: user not found or does not exist'
            });
        }
        // check if password matches
        const hashedPassword = user.password;
        const comparePasswords = await decryptHandler({ stringToCompare: password, hashedString: hashedPassword });
        if (!comparePasswords) {
            res.status(403).json({
                error: 'access forbidden',
                responseMessage: 'incorrect password: login unsuccessful'
            });
        }
        if (user && comparePasswords) {
            const generatedTokens = await generateTokens({ user });
            // send new accessToken well just in case the previous one has expired
            const { refreshToken, accessToken } = generatedTokens;
            // console.log(accessToken);
            const updatedUser = await findAndUpdateUser({ email: email, requestBody: { accessToken } });
            // const subSessionActivity = (await findSessionActivity({ activityId: sub_session_activity_id })) as SessionActivitySpecs;
            if (updatedUser) {
                res.cookie('Web3Mastery_SecretRefreshToken', refreshToken, {
                    // domain: 'localhost:3000',
                    // path: '/',
                    httpOnly: true,
                    secure: true, // prevents "man-in-the-middle" attacks
                    sameSite: 'strict', // Prevent CSRF attacks
                    maxAge: 24 * 60 * 60 * 1000 // 1 day
                });
                //   const { accessToken } = generatedTokens as { accessToken: string };
                // console.log(`user is ${user}`);
                return res.status(200).json({
                    responseMessage: 'user logged in successfully',
                    response: {
                        user: updatedUser
                    }
                });
            }
        }
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({
                responseMessage: 'user login failed',
                error: error.message
            });
        }
        else {
            return res.status(500).json({
                responseMessage: 'user login failed: please try again',
                error: error
            });
        }
    }
    return;
};
export default loginUser;
