import type { Request, Response } from 'express';
import { findUser } from '../lib/user.findUser.service.js';
import type { UserSpecs } from '../schemas/userSchema.zod.js';

// description: get the profile of any user.
// request: GET
// route: '/api/v1/user/get-user-profile/:userId";
// access: Public

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    userProfile: UserSpecs;
  };
  sessionStatus?: string;
};

const getUserProfileData = async (req: Request<{ userId: string }, ResponseSpecs>, res: Response<ResponseSpecs>) => {
  try {
    if (req.user) {
      const { userId } = req.params;

      const user = await findUser({ id: userId });

      if (!user) {
        return res.status(404).json({
          error: 'user error',
          responseMessage: `user with this Id: 'userId' not found or does not exist`
        });
      }

      const publicUserProfile = {
        name: user.name,
        bio: user.bio,
        website: user.website,
        linkedInProfile: user.linkedInProfile,
        githubProfile: user.githubProfile,
        twitterProfile: user.twitterProfile,
        youtubeProfile: user.youtubeProfile,
        communityRank: user.communityRank,
        skills: user.skills,
        education: user.education,
        experience: user.experience,
        resume: user.resume
      };

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
          userProfile: publicUserProfile
        },
        sessionStatus
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
