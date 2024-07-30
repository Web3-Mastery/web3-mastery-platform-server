import type { Request, Response } from 'express';
import { findUser } from '../lib/user.findUser.service.js';
import type { UserSpecs } from '../schemas/userSchema.zod.js';
import { findAndUpdateUser } from '../lib/user.findAndUpdateUser.service.js';

// description: get personal(user) profile(by ID), and send back relevant data as response.
// request: GET
// route: '/api/v1/user/update-personal-profile/:userId";
// access: Private

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    updatedProfile: UserSpecs;
    sessionStatus?: string;
    accessToken: string;
  };
};

const updatePersonalProfile = async (req: Request<{ userId: string }, ResponseSpecs, UserSpecs>, res: Response<ResponseSpecs>) => {
  try {
    if (req.user) {
      console.log(req.user);

      const { userId } = req.params;

      const user = await findUser({ id: userId });

      if (!user) {
        return res.status(404).json({
          error: 'user error',
          responseMessage: `user with this Id: 'userId' not found or does not exist`
        });
      }

      if (req.user.userId !== userId) {
        return res.status(403).json({
          error: 'user error',
          responseMessage: `user/email provided in request header is not authorized to perform this action for user with id: '${userId}'`
        });
      }

      const updatedUser = await findAndUpdateUser({ id: userId, requestBody: req.body });

      const { newUserRefreshToken, newUserAccessToken, sessionStatus } = req?.user;

      if (updatedUser && newUserAccessToken) {
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
            updatedProfile: updatedUser,
            accessToken: newUserAccessToken,
            sessionStatus
          }
        });
      }
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

export default updatePersonalProfile;
