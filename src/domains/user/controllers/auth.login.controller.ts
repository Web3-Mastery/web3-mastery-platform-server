import type { Request, Response } from 'express';
import type { UserSpecs } from '../schemas/userSchema.zod.js';
import { validatePasswordWithRegex } from '../../../utils/validatePasswordWithRegex.js';
import { findUser } from '../lib/user.findUser.service.js';
import decryptHandler from '../../../utils/decryptHandler.js';
import generateTokens from '../../../utils/generateTokens.js';
import { findAndUpdateUser } from '../lib/user.findAndUpdateUser.service.js';

// description: Authenticate user, set refresh-token(cookie), & send access-token(jwt)
// request: POST
// route: '/api/v1/auth/log-in'
// access: Public

type InSpecs = {
  email: string;
  password: string;
};

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    user: UserSpecs;
  };
};

const loginUser = async (req: Request<{}, ResponseSpecs, InSpecs>, res: Response<ResponseSpecs>) => {
  try {
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
    const hashedPassword = user.password as string;
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
      const { refreshToken, accessToken } = generatedTokens as { refreshToken: string; accessToken: string };
      // console.log(accessToken);

      if (user.sessions && user.sessions.length > 0) {
        // console.log(user.sessions);
        const currentSession = user.sessions[user.sessions.length - 1];

        if (currentSession) {
          const currentSubSession = currentSession[currentSession.length - 1];

          const currentSessionId = currentSubSession?.sessionId;

          const newSessionId = Number(currentSessionId) + 1;

          const currentTimeInMilliseconds = Date.now();

          const newCurrentSubSessionObject = {
            checkInTime: currentTimeInMilliseconds.toString(),
            subSessionActivity: 'user log-in',
            sessionId: newSessionId.toString() // same id since they are on the same session
          };

          user.sessions?.push([newCurrentSubSessionObject]);

          const updatedUser = await findAndUpdateUser({
            email: user.email,
            requestBody: {
              sessions: user.sessions,
              accessToken: accessToken
            }
          });

          if (updatedUser) {
            // set refresh token as cookie for authorization purposes
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
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({
        responseMessage: 'user login failed',
        error: error.message
      });
    } else {
      return res.status(500).json({
        responseMessage: 'user login failed: please try again',
        error: error as string
      });
    }
  }

  return;
};

export default loginUser;
