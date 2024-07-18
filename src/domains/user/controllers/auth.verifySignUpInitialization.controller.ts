import type { Request, Response } from 'express';
// import nodemailer from 'nodemailer';
import { findUser } from '../lib/user.findUser.service.js';
// import generateTokens from '../../../utils/generateTokens.js';
import { findPreSignUpUser } from '../lib/user.findPreSignUpUser.service.js';
// import { createPreSignUpUser } from '../lib/auth.createPreSignUpUser.service.js';
import type { UserSpecs } from '../schemas/userSchema.zod.js';
import decryptHandler from '../../../utils/decryptHandler.js';
import { deletePreSignUpUser } from '../lib/user.deletePreSignUpUser.service.js';

/* description: receives and verifies the returned sign-up token. If expired, pre-sign-up user is deleted, and user is asked and 
redirected(by the front-end engineer) to attempt the sign-up initialization again... */
// request: POST
// route: '/api/v1/auth/verify-sign-up-initialization'
// access: Public

type inSpecs = {
  preSignUpToken: string;
};

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    preSignUpUser?: UserSpecs;
    sessionStatus: string;
  };
};

const verifySignUpInitialization = async (req: Request<{}, ResponseSpecs, inSpecs>, res: Response<ResponseSpecs>) => {
  const { preSignUpToken } = req.body;
  //   console.log(preSignUpToken);

  try {
    // console.log(req.user);
    if (req.user) {
      const existingUser = await findUser({ email: req.user.userEmail });

      if (existingUser) {
        return res.status(400).json({
          error: 'duplicate user error',
          responseMessage: 'a user account with this email already exist, please login to your account instead'
        });
      }

      if (!preSignUpToken) {
        return res.status(403).json({
          error: 'request rejected',
          responseMessage: 'pre-sign-up token not provided for verification'
        });
      }
      // console.log(email, name);
      const { userEmail } = req.user;

      // decrypt preSignUpToken, then split the resulting string to extract email
      const preSignUpUser = await findPreSignUpUser({ preSignUpToken });

      if (!preSignUpUser) {
        return res.status(403).json({
          error: 'request rejected',
          responseMessage: 'sign-up process not initiated or pre-sign-up token is invalid'
        });
      }

      // console.log(userEmail);
      if (userEmail !== preSignUpUser.email) {
        return res.status(403).json({
          error: 'request rejected',
          responseMessage: `email provided in request header does not match owner(email on database) with the provided preSignUpToken`
        });
      }

      if (preSignUpUser) {
        const isPreSignUpTokenValid = await decryptHandler({
          stringToCompare: `${preSignUpUser.email}_${process.env.JWT_SECRET}`,
          hashedString: preSignUpToken
        });

        //   console.log(isPreSignUpTokenValid);

        if (!isPreSignUpTokenValid) {
          return res.status(400).json({
            error: 'request rejected',
            responseMessage: 'pre-sign-up token is not valid'
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

        // Check if the difference has exceeded 24 hours
        if (differenceInMilliseconds > twentyHoursInMilliseconds) {
          console.log('the pre-sign-up token has exceeded 24 hours.');
          await deletePreSignUpUser({ email: preSignUpUser.email });

          return res.status(403).json({
            error: 'request rejected',
            responseMessage: 'pre-sign-up token has expired'
          });
        } else {
          const { newUserRefreshToken, sessionStatus } = req?.user;

          // update refresh token(cookie)
          res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none', // Prevent CSRF attacks
            maxAge: 24 * 60 * 60 * 1000 // 1 day
          });

          // console.log('the pre-sign-up token has not yet exceeded 24 hours.');
          return res.status(201).json({
            responseMessage: 'verification successful: pre-sign-up token verified successfully',
            response: { preSignUpUser, sessionStatus }
          });
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
  // }

  return;
};

export default verifySignUpInitialization;
