import type { Request, Response } from 'express';
import type { JobCategorySpecs } from '../../schemas/jobCategory.schema.js';
import { findJobCategory } from '../../lib/jobCategoryManagement/platform.findJobCategory.service.js';
import { findUser } from '../../../user/lib/user.findUser.service.js';
import { createJobCategory } from '../../lib/jobCategoryManagement/platform.createJobCategory.service.js';

// description: creates a new platform job/content category
// request: job
// route: '/api/v1/platform/job-category-management/create-job-category'
// access: Private(admin only)

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    jobCategory: JobCategorySpecs;
    accessToken: string;
    sessionStatus?: string;
  };
};

const createPlatformJobCategory = async (req: Request<{}, ResponseSpecs, JobCategorySpecs>, res: Response<ResponseSpecs>) => {
  if (req.user) {
    try {
      const { categoryId } = req.body;
      const { userEmail, sessionStatus, newUserAccessToken, newUserRefreshToken } = req.user;

      const user = await findUser({ email: userEmail });

      if (!user || user.isAdmin !== true) {
        return res.status(403).json({
          error: 'request rejected',
          responseMessage: 'only platform administrators are allowed to perform this action'
        });
      }

      const existingJobCategory = await findJobCategory({ categoryId });

      if (existingJobCategory) {
        return res.status(400).json({
          error: 'duplicate job category detected',
          responseMessage: `request unsuccessful: a job category with categoryId: '${categoryId}' already exist`
        });
      }

      const newJobCategory = await createJobCategory({ jobCategoryData: req.body });

      if (newJobCategory && newUserAccessToken) {
        res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none', // Prevent CSRF attacks
          maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return res.status(200).json({
          responseMessage: 'job category created successfully',
          response: {
            jobCategory: newJobCategory,
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
  // }

  return;
};

export default createPlatformJobCategory;
