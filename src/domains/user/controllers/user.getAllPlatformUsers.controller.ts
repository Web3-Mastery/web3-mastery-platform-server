import type { Request, Response } from 'express';
// import { findUser } from '../lib/user.findUser.service.js';
import type { UserSpecs } from '../schemas/userSchema.zod.js';
import { fetchAllPlatformUsers } from '../lib/user.fetchAllPlatformUsers.service.js';

// description: get the profile of any user.
// request: GET
// route: '/api/v1/user/get-user-profile/:userId";
// access: Public

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    allPlatformUsers: UserSpecs[];
    platformUsersCount: string;
    sessionStatus?: string;
    accessToken: string;
  };
};

const getAllPlatformUsers = async (req: Request<{}, ResponseSpecs>, res: Response<ResponseSpecs>) => {
  try {
    if (req.user) {
      // const { userId } = req.params;

      const allPlatformUsers = await fetchAllPlatformUsers();

      const { newUserRefreshToken, sessionStatus, newUserAccessToken } = req?.user;

      if (allPlatformUsers && newUserAccessToken) {
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
            allPlatformUsers,
            platformUsersCount: allPlatformUsers.length.toString(),
            sessionStatus,
            accessToken: newUserAccessToken
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

export default getAllPlatformUsers;
