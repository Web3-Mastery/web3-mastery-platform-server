import type { Request, Response } from 'express';
import type { JobCategorySpecs } from '../../schemas/jobCategory.schema.js';
import { fetchAllJobCategories } from '../../lib/jobCategoryManagement/platform.fetchAllJobCategories.service.js';
import { findUser } from '../../../user/lib/user.findUser.service.js';

// description: get all platform-job categories, and send back relevant data as response.
// request: GET
// route: '/api/v1/platform/job-category-management/get-all-platform-job-categories";
// access: Private

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    platformJobCategoriesCount: number;
    platformJobCategories: JobCategorySpecs[];
    accessToken: string;
    sessionStatus: string;
  };
};

// @ts-ignore
const getAllPlatformJobCategories = async (req: Request<{}, ResponseSpecs>, res: Response<ResponseSpecs>) => {
  if (req.user) {
    const { userEmail, sessionStatus, newUserAccessToken, newUserRefreshToken } = req.user;

    try {
      const user = await findUser({ email: userEmail });

      if (!user || user.isAdmin !== true) {
        return res.status(403).json({
          error: 'request rejected',
          responseMessage: 'only platform administrators are allowed to perform this action'
        });
      }

      const platformJobCategories = await fetchAllJobCategories();

      if (!platformJobCategories) {
        return res.status(400).json({
          error: 'item not found',
          responseMessage: `could not fetch platform job categories list: list not found of does not exist`
        });
      }

      // update refresh token(cookie)
      // res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
      //   httpOnly: true,
      //   secure: true,
      //   sameSite: 'none', // Prevent CSRF attacks
      //   maxAge: 24 * 60 * 60 * 1000 // 1 day
      // });

      if (platformJobCategories && newUserAccessToken && sessionStatus) {
        //  update refresh token(cookie)
        res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none', // Prevent CSRF attacks
          maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return res.status(200).json({
          responseMessage: `user profile fetched successfully`,
          response: {
            platformJobCategoriesCount: platformJobCategories.length,
            platformJobCategories: platformJobCategories,
            accessToken: newUserAccessToken,
            sessionStatus: sessionStatus
          }
        });
      }
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
  }
};

export default getAllPlatformJobCategories;
