import type { Request, Response } from 'express';
import decryptHandler from '../../../utils/decryptHandler.js';
import type { NewsletterSubscriberSpecs } from '../schemas/newsletter-subscriber.zod.js';
import { findNewsletterSubscriber } from '../lib/newsletter.findSubscriber.service.js';
import { deleteNewsletterSubscriber } from '../lib/newsletter.deleteNewsletterSubscriber.service.js';

/* description: receives and verifies the returned newsletter subscription token. If expire user is asked and 
redirected(by the front-end engineer) to attempt the subscription initialization again... */
// request: POST
// route: '/api/v1/newsletter-subscription/verify-subscription'
// access: Public

type inSpecs = {
  newsletterSubscriptionToken: string;
};

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    confirmedSubscriber?: NewsletterSubscriberSpecs;
    // sessionStatus: string;
  };
};

const verifySignUpInitialization = async (req: Request<{}, ResponseSpecs, inSpecs>, res: Response<ResponseSpecs>) => {
  //   console.log(preSignUpToken);
  if (req.user) {
    try {
      // console.log(req.user);
      // if (req.user && req.user.sessionStatus) {
      const { userEmail, subSessionActivityId: sub_session_activity_id } = req.user;
      const { newsletterSubscriptionToken } = req.body;

      if (!newsletterSubscriptionToken) {
        return res.status(403).json({
          error: 'request rejected',
          responseMessage: 'newsletter subscription token not provided for verification'
        });
      }
      // console.log(email, name);

      if (!sub_session_activity_id || !userEmail) {
        return res.status(401).json({
          error: 'access forbidden',
          responseMessage: `request header data missing or is not provided via the user object on the request: 'email' 
          and 'sub_session_activity_id' must be provided as request header data`
        });
      }

      // decrypt preSignUpToken, then split the resulting string to extract email
      const newsletterSubscriber = await findNewsletterSubscriber({ email: userEmail });

      if (!newsletterSubscriber) {
        return res.status(403).json({
          error: 'request rejected',
          responseMessage: 'sign-up process not initiated or pre-sign-up token is invalid'
        });
      }

      // console.log(userEmail);
      if (userEmail !== newsletterSubscriber.email) {
        return res.status(403).json({
          error: 'request rejected',
          responseMessage: `email provided in request header does not match owner(email on database) with 
          the provided preSignUpToken`
        });
      }

      if (newsletterSubscriber) {
        const isNewsletterSubscriptionTokenValid = await decryptHandler({
          stringToCompare: `${newsletterSubscriber.email}_${process.env.JWT_SECRET}`,
          hashedString: newsletterSubscriptionToken
        });

        //   console.log(isPreSignUpTokenValid);

        if (!isNewsletterSubscriptionTokenValid) {
          return res.status(400).json({
            error: 'request rejected',
            responseMessage: 'newsletter subscription token is not valid'
          });
        }

        // check for token creation date, and delete that pre-sign-up-user if the token has exceeded 24 hours so that the user can restart the pre-sign-up process afresh.
        // console.log(newsletterSubscriber.createdAt);
        const date = new Date(newsletterSubscriber.createdAt);

        // Get the time in milliseconds since the Unix epoch
        const newsletterSubscriberCreationTime = date.getTime();
        // console.log(newsletterSubscriberCreationTime);

        // Get the current time in milliseconds
        const currentTimeInMilliseconds = Date.now();

        // Calculate the difference in milliseconds
        const differenceInMilliseconds = currentTimeInMilliseconds - newsletterSubscriberCreationTime;

        // Calculate 72 hours in milliseconds
        const twentyHoursInMilliseconds = 72 * 60 * 60 * 1000;
        // const twentyHoursInMilliseconds = 60;

        // Check if the difference has exceeded 72 hours(3 days)
        // const { newUserRefreshToken } = req?.user;

        if (differenceInMilliseconds > twentyHoursInMilliseconds) {
          console.log('the pre-sign-up token has exceeded 72 hours.');
          await deleteNewsletterSubscriber({ email: newsletterSubscriber.email });

          return res.status(403).json({
            error: 'request rejected',
            responseMessage: 'newsletter subscription token has expired'
          });
        } else {
          // update refresh token(cookie)
          // res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
          //   httpOnly: true,
          //   secure: true,
          //   sameSite: 'none', // Prevent CSRF attacks
          //   maxAge: 24 * 60 * 60 * 1000 // 1 day
          // });

          // console.log('the pre-sign-up token has not yet exceeded 24 hours.');
          return res.status(201).json({
            responseMessage: 'verification successful: pre-sign-up token verified successfully',
            response: { confirmedSubscriber: { ...newsletterSubscriber, isVerified: true } }
          });
        }
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
  }
  // }

  return;
};

export default verifySignUpInitialization;
