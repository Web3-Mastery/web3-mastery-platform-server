import type { Request, Response } from 'express';
import type { JobCategorySpecs } from '../../schemas/jobCategory.schema.js';
import { findJobCategory } from '../../lib/jobCategoryManagement/platform.findJobCategory.service.js';
import { findUser } from '../../../user/lib/user.findUser.service.js';

// description: get session activity, and send back relevant data as response.
// request: GET
// route: '/api/v1/platform/job-category-management/get-job-category/:categoryId";
// access: Private(admin-only)

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    jobCategory: JobCategorySpecs;
    accessToken: string;
    sessionStatus?: string;
  };
};

const getJobCategory = async (req: Request<{ categoryId: string }, ResponseSpecs>, res: Response<ResponseSpecs>) => {
  if (req.user) {
    try {
      const { categoryId } = req.params;

      const { userEmail, sessionStatus, newUserAccessToken, newUserRefreshToken } = req.user;

      const user = await findUser({ email: userEmail });

      if (!user || user.isAdmin !== true) {
        return res.status(403).json({
          error: 'request rejected',
          responseMessage: 'only platform administrators are allowed to perform this action'
        });
      }

      const existingJobCategory = await findJobCategory({ categoryId });

      if (!existingJobCategory) {
        return res.status(400).json({
          error: 'item not found',
          responseMessage: `job category with categoryId: '${categoryId}' not found or does not exist`
        });
      }

      if (existingJobCategory && newUserAccessToken) {
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
            jobCategory: existingJobCategory,
            accessToken: newUserAccessToken,
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
  }

  return;
};

export default getJobCategory;
