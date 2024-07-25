import type { Request, Response } from 'express';
// import nodemailer from 'nodemailer';
import { findUser } from '../lib/user.findUser.service.js';
// import generateTokens from '../../../utils/generateTokens.js';
import { findPreSignUpUser } from '../lib/user.findPreSignUpUser.service.js';
// import { createPreSignUpUser } from '../lib/auth.createPreSignUpUser.service.js';
import type { UserSpecs } from '../schemas/userSchema.zod.js';
import decryptHandler from '../../../utils/decryptHandler.js';
import { deletePreSignUpUser } from '../lib/user.deletePreSignUpUser.service.js';
import { createUser } from '../lib/auth.createUser.service.js';
import hashingHandler from '../../../utils/hashingHandler.js';
import { findAndUpdatePreSignUpUser } from '../lib/user.findAndUpdatePreSignUpUser.service.js';
import generateTokens from '../../../utils/generateTokens.js';

/* description: receives and verifies the returned sign-up token. If expired, pre-sign-up user is deleted, and user is asked and 
redirected(by the front-end engineer) to attempt the sign-up initialization again... */
// request: POST
// route: '/api/v1/auth/verify-sign-up-initialization'
// access: Public

type ResponseSpecs = {
  error?: string | {};
  responseMessage: string;
  response?: {
    user: UserSpecs;
    sessionStatus: string;
  };
};

const completeSignUp = async (req: Request<{}, ResponseSpecs, UserSpecs>, res: Response<ResponseSpecs>) => {
  const { name, email, password, confirmPassword } = req.body;
  const { preSignUpToken } = req.query;
  //   console.log(preSignUpToken);

  try {
    if (req.user) {
      const existingUser = await findUser({ email });

      if (existingUser) {
        return res.status(400).json({
          error: 'duplicate user error',
          responseMessage: 'a user account with this email already exist, please login to your account instead'
        });
      }

      if (!name || !email || !password || !confirmPassword) {
        return res.status(403).json({
          error: 'request rejected',
          responseMessage: 'required user input missing or user input is incomplete'
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          error: 'request rejected',
          responseMessage: 'password and confirmPassword must match'
        });
      }

      if (!preSignUpToken) {
        return res.status(403).json({
          error: 'request rejected',
          responseMessage: 'pre-sign-up token not provided for verification'
        });
      }

      // console.log(email, name);
      const _preSignUpToken = preSignUpToken as string;

      // decrypt preSignUpToken, then split the resulting string to extract email
      const preSignUpUser = await findPreSignUpUser({ preSignUpToken: _preSignUpToken });

      if (!preSignUpUser) {
        return res.status(403).json({
          error: 'request rejected',
          responseMessage: 'sign-up process not initiated or pre-sign-up token is invalid'
        });
      }

      if (preSignUpUser) {
        const isPreSignUpTokenValid = await decryptHandler({
          stringToCompare: `${email}_${process.env.JWT_SECRET}`,
          hashedString: _preSignUpToken
        });

        //   console.log(isPreSignUpTokenValid);

        if (!isPreSignUpTokenValid) {
          return res.status(400).json({
            error: 'request rejected',
            responseMessage: `pre-sign-up token is not valid for '${email}'`
          });
        }

        // check for token creation date, and delete that pre-sign-up-user if the token has exceeded 24 hours so that the user can restart the pre-sign-up process afresh.
        // console.log(preSignUpUser.createdAt);
        const date = new Date(preSignUpUser.createdAt);

        // Get the time in milliseconds since the Unix epoch
        const preSignUpUserCreationTime = date.getTime();
        // console.log(preSignUpUserCreationTime);

        // Get the current time in milliseconds
        const currentTimeInMilliseconds = Date.now();

        // Calculate the difference in milliseconds
        const differenceInMilliseconds = currentTimeInMilliseconds - preSignUpUserCreationTime;

        // Calculate 24 hours in milliseconds
        const twentyHoursInMilliseconds = 24 * 60 * 60 * 1000;
        // const twentyHoursInMilliseconds = 60;

        const existingUser = await findUser({ email: preSignUpUser.email });

        // Check if the difference has exceeded 24 hours
        if (differenceInMilliseconds > twentyHoursInMilliseconds) {
          console.log('the pre-sign-up token has exceeded 24 hours.');
          await deletePreSignUpUser({ email: preSignUpUser.email });

          return res.status(403).json({
            error: 'request rejected',
            responseMessage: 'expired pre-sign-up token was used'
          });
        } else {
          console.log('the pre-sign-up token has not yet exceeded 24 hours.');

          if (existingUser) {
            return res.status(400).json({
              error: 'duplicate user error',
              responseMessage: 'a user account with this email already exist'
            });
          }

          const hashedPassword = await hashingHandler({ stringToHash: password });
          const hashedConfirmPassword = await hashingHandler({ stringToHash: password });

          // don't use the same accessTokens for a preSignUpUser, and a fullySignedUpUser
          const { newUserRefreshToken, sessionStatus } = req?.user;

          // update refresh token(cookie)
          res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none', // Prevent CSRF attacks
            maxAge: 24 * 60 * 60 * 1000 // 1 day
          });

          const updatedPreSignUpUser = await findAndUpdatePreSignUpUser({
            email: preSignUpUser.email,
            requestBody: { signUpStatus: 'sign-up-completed' }
          });
          //   console.log(updatedPreSignUpUser);

          const { name, email, signUpStatus, secretSignUpToken, sessions } = updatedPreSignUpUser as UserSpecs;

          // this user has to be created first, so that it's Id then be re-obtained as below and used to generate it's own access token.
          const newFullySignedUpUser = await createUser({
            user: {
              name,
              email,
              signUpStatus,
              secretSignUpToken,
              sessions,
              password: hashedPassword,
              confirmPassword: hashedConfirmPassword
            }
          });

          if (preSignUpUser && newFullySignedUpUser && sessionStatus) {
            // find the newly created user, and add it's token to it
            const fullySignedUpUser_WithOutAccessToken = await findUser({ email: newFullySignedUpUser.email });
            // console.log(fullySignedUpUser_WithOutAccessToken);

            const tokenForFullySignedUpUser = await generateTokens({
              user: { _id: fullySignedUpUser_WithOutAccessToken?._id, email: fullySignedUpUser_WithOutAccessToken?.email }
            });

            const { accessToken } = tokenForFullySignedUpUser as { accessToken: string; refreshToken: string };

            return res.status(201).json({
              responseMessage: 'user sign-up completed successfully',
              response: {
                user: {
                  name,
                  email,
                  signUpStatus,
                  secretSignUpToken,
                  sessions,
                  skills: fullySignedUpUser_WithOutAccessToken?.skills,
                  education: fullySignedUpUser_WithOutAccessToken?.education,
                  experience: fullySignedUpUser_WithOutAccessToken?.experience,
                  password: hashedPassword,
                  confirmPassword: hashedConfirmPassword,
                  accessToken: accessToken,
                  _id: fullySignedUpUser_WithOutAccessToken?._id
                },
                sessionStatus
              }
            });
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      const errorString = error.message as string;

      return res.status(500).json({
        responseMessage: 'process error',
        error: errorString
      });
    } else {
      console.log(error);
      return res.status(500).json({
        responseMessage: 'process error: please try again',
        error: error as string
      });
    }
  }

  return;
};

export default completeSignUp;
