import type { Request, Response } from 'express';
import { findUser } from '../lib/user.findUser.service.js';
import type { UserSpecs } from '../schemas/userSchema.zod.js';
import { findAndUpdateUser } from '../lib/user.findAndUpdateUser.service.js';

// description: get the profile of any user.
// request: PATCH
// route: '/api/v1/user/activate-recruiter-profile/:userId";
// access: Public

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    userWithRecruiterProfile: UserSpecs;
    sessionStatus?: string;
  };
};

const getUserProfileData = async (req: Request<{ userId: string }, ResponseSpecs>, res: Response<ResponseSpecs>) => {
  try {
    if (req.user) {
      const { userId } = req.params;

      const user = await findUser({ id: userId });

      if (!user) {
        return res.status(404).json({
          error: 'user error',
          responseMessage: `user with this Id: '${userId}' not found or does not exist`
        });
      }

      const recruiterActivatedUser = await findAndUpdateUser({
        id: userId,
        requestBody: {
          ...user,
          isRecruiterEnabled: true
        }
      });

      const { newUserRefreshToken, sessionStatus } = req?.user;

      // update refresh token(cookie)
      res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none', // Prevent CSRF attacks
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      return res.status(200).json({
        responseMessage: `user profile fetched successfully`,
        response: {
          userWithRecruiterProfile: recruiterActivatedUser as UserSpecs,
          sessionStatus
        }
      });
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
};

export default getUserProfileData;
