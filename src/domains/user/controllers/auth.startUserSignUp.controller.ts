import type { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { findUser } from '../lib/user.findUser.service.js';
import generateTokens from '../../../utils/generateTokens.js';
import { findPreSignUpUser } from '../lib/user.findPreSignUpUser.service.js';
import { createPreSignUpUser } from '../lib/auth.createPreSignUpUser.service.js';
import type { UserSpecs } from '../schemas/userSchema.zod.js';
import { findAndUpdatePreSignUpUser } from '../lib/user.findAndUpdatePreSignUpUser.service.js';
import { deletePreSignUpUser } from '../lib/user.deletePreSignUpUser.service.js';
import { findSessionActivity } from '../../platform/lib/sessionActivityManagement/platform.findSessionActivity.service.js';
import type { SessionActivitySpecs } from '../../platform/schemas/sessionActivity.schema.js';
// import preSignUpUserModel from '../models/preSignUpUser.model.js';

// description: creates a new pre-sign-up user
// request: POST
// route: '/api/v1/auth/start-sign-up'
// access: Public

type inSpecs = {
  name: string;
  email: string;
};

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    preSignUpUser: UserSpecs;
  };
};

// type RequestHeaderContentSpecs = {
//   authorization: string;
//   email: string;
//   sub_session_activity_id: string;
// };

const startUserSignUp = async (req: Request<{}, ResponseSpecs, inSpecs>, res: Response<ResponseSpecs>) => {
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

    const { name, email } = req.body;

    // if (req.user) {
    if (!email || !name) {
      return res.status(400).json({
        error: 'required user input missing',
        responseMessage: 'request unsuccessful: please provide all inputs'
      });
    }
    // console.log(email, name);

    const existingUser = await findUser({ email });

    if (existingUser) {
      return res.status(400).json({
        error: 'duplicate user error',
        responseMessage: 'a user account with this email already exist, please login to your account instead'
      });
    }

    const existingPreSignUpUser = await findPreSignUpUser({ email });

    if (existingPreSignUpUser) {
      // check for token creation date, and delete that pre-sign-up-user if the token has exceeded 24 hours so that the user can restart the pre-sign-up process afresh.
      // console.log(existingPreSignUpUser.createdAt);
      const date = new Date(existingPreSignUpUser.createdAt);

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
        await deletePreSignUpUser({ email: existingPreSignUpUser.email });

        return res.status(403).json({
          error: 'request rejected',
          responseMessage: 'pre-sign-up token has expired'
        });
      } else {
        return res.status(400).json({
          error: 'duplicate pre-signup user error',
          responseMessage: 'sign-up already initiated. please check your email to see your private sign-up link'
        });
      }
    }

    // generate signup link
    const signUpToken = await generateTokens({ tokenType: 'preSignUpToken', user: { name, email } });

    const subSessionActivity = (await findSessionActivity({ activityId: sub_session_activity_id })) as SessionActivitySpecs;
    // console.log(subSessionActivity);

    const newPreSignUpUser = await createPreSignUpUser({
      user: {
        name,
        email,
        secretSignUpToken: signUpToken as string,
        sessions: [[{ checkInTime: '0', subSessionActivity: subSessionActivity, sessionId: '1' }]]
      }
    });

    // generate tokens, pass access token, and set refresh token
    const generatedTokens = await generateTokens({ user: { email, name, _id: newPreSignUpUser._id } });
    const { refreshToken, accessToken } = generatedTokens as { accessToken: string; refreshToken: string };

    if (newPreSignUpUser) {
      const { email, signUpStatus, secretSignUpToken, sessions } = newPreSignUpUser;

      const preSignUpUserWithAccessToken = await findAndUpdatePreSignUpUser({
        email: newPreSignUpUser.email,
        requestBody: { name: newPreSignUpUser.name, email, signUpStatus, secretSignUpToken, sessions, accessToken }
      });
      // console.log(preSignUpUserWithAccessToken);

      // set refresh token as cookie for authorization purposes
      res.cookie('Web3Mastery_SecretRefreshToken', refreshToken, {
        // domain: 'localhost',
        // path: '/',
        httpOnly: true,
        secure: true, // prevents "man-in-the-middle" attacks
        sameSite: 'strict', // Prevent CSRF attacks
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      const web3MasteryClientBaseURL = process.env.WEB3MASTERY_WEBSITE_BASE;

      const secretSignUpLink = `${web3MasteryClientBaseURL}/complete-sign-up/?signUpToken=${signUpToken}`;

      const transporter = nodemailer.createTransport({
        host: process.env.ADMIN_EMAIL_HOST,
        secure: true,
        port: 465,
        auth: {
          user: process.env.ADMIN_CONTROLLER_EMAIL,
          pass: process.env.ADMIN_EMAIL_APP_PASSWORD
        }
      });

      const userFirstName = name.split(' ')[0] as string;

      const mailOptions = {
        from: `"Web3 Mastery" ${process.env.ADMIN_CONTROLLER_EMAIL}`,
        to: email,
        subject: 'Complete Web3 Mastery SignUp',
        html: `<p>GM ${userFirstName?.charAt(0).toUpperCase() + userFirstName?.slice(1)}, <br/><br/> Great to have you join Web3 Mastery. <br/><br/>
                Use the secret link below to complete your sign-up <br/><br/>
                ${secretSignUpLink}
                <br/><br/>
                Best regards, <br/><br/>
                <strong>- The Web3 Mastery Team.</strong><br/><br/>
                `
      };

      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.log(err);
        } else {
          return res.status(200).json({
            responseMessage: `sign-up initiated: private sign-up link successfully sent to '${email}'`,
            response: { preSignUpUser: preSignUpUserWithAccessToken as UserSpecs }
          });
        }

        return;
      });
    }
    // }
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
// }

export default startUserSignUp;
