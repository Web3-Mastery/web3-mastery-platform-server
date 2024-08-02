import type { Request, Response } from 'express';
import type { JobCategorySpecs } from '../../schemas/jobCategory.schema.js';
import { findJobCategory } from '../../lib/jobCategoryManagement/platform.findJobCategory.service.js';
import { findAndUpdateJobCategory } from '../../lib/jobCategoryManagement/platform.findAndUpdateJobCategory.service.js';
import { findUser } from '../../../user/lib/user.findUser.service.js';

// description: updates a new platform-job category data
// request: PATCH
// route: '/api/v1/platform/job-category-management/update-job-category/:categoryId'
// access: Private(admin only)

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    updatedJobCategory: JobCategorySpecs;
    accessToken: string;
    sessionStatus?: string;
  };
};

const updateJobCategory = async (req: Request<{}, ResponseSpecs, JobCategorySpecs>, res: Response<ResponseSpecs>) => {
  if (req.user) {
    const { categoryId, categoryName } = req.body;
    const { userEmail, sessionStatus, newUserAccessToken, newUserRefreshToken } = req.user;

    try {
      const user = await findUser({ email: userEmail });

      if (!user || user.isAdmin !== true) {
        return res.status(403).json({
          error: 'request rejected',
          responseMessage: 'only platform administrators are allowed to perform this action'
        });
      }

      if (!categoryName || !categoryId) {
        return res.status(400).json({
          error: 'required job-category data missing',
          responseMessage: 'request unsuccessful: please provide all job-category data'
        });
      }
      // console.log(email, name);

      const existingJobCategory = await findJobCategory({ categoryId });

      if (!existingJobCategory) {
        return res.status(400).json({
          error: 'item not found',
          responseMessage: `job-category with categoryId: '${categoryId}' not found or does not exist`
        });
      }

      const updatedJobCategory = await findAndUpdateJobCategory({ categoryId: categoryId, requestBody: req.body });

      if (updatedJobCategory && newUserAccessToken) {
        res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none', // Prevent CSRF attacks
          maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return res.status(200).json({
          responseMessage: 'session activity updated successfully',
          response: {
            updatedJobCategory: updatedJobCategory,
            accessToken: newUserAccessToken,
            sessionStatus
          }
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
  }

  return;
};

export default updateJobCategory;
