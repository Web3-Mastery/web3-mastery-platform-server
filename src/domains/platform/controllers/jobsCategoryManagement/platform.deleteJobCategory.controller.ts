import type { Request, Response } from 'express';
import type { DeleteResult } from 'mongodb';
// import nodemailer from 'nodemailer';
import type { JobCategorySpecs } from '../../schemas/jobCategory.schema.js';
import { findJobCategory } from '../../lib/jobCategoryManagement/platform.findJobCategory.service.js';
import { deleteJobCategory } from '../../lib/jobCategoryManagement/platform.deleteJobCategory.service.js';
import { findUser } from '../../../user/lib/user.findUser.service.js';

// description: deletes a platform job-category
// request: DELETE
// route: '/api/v1/platform/job-category-management/delete-job-category/:categoryId'
// access: Private

type ResponseSpecs = {
  error?: string | {};
  responseMessage: string;
  response?: {
    deleteResult: DeleteResult;
    deletedJobCategory: JobCategorySpecs;
    accessToken: string;
    sessionStatus?: string;
  };
};

const deletePlatformjobCategory = async (req: Request<{}, ResponseSpecs, JobCategorySpecs>, res: Response<ResponseSpecs>) => {
  if (req.user) {
    const { jobCategoryId } = req.query;

    const _categoryId = jobCategoryId as string;
    try {
      const { userEmail, sessionStatus, newUserAccessToken, newUserRefreshToken } = req.user;

      const user = await findUser({ email: userEmail });

      if (!user || user.isAdmin !== true) {
        return res.status(403).json({
          error: 'request rejected',
          responseMessage: 'only platform administrators are allowed to perform this action'
        });
      }

      const existingJobCategory = await findJobCategory({ categoryId: _categoryId });
      // console.log(existingSessionActivity);

      if (!existingJobCategory) {
        return res.status(400).json({
          error: 'process empty',
          responseMessage: `job-category with categoryId: '${_categoryId}' does not exist or has already been deleted`
        });
      }

      const deletedResponse = await deleteJobCategory({ categoryId: _categoryId });

      if (deletedResponse && deletedResponse.acknowledged === true && newUserAccessToken && newUserRefreshToken) {
        //  update refresh token(cookie)
        res.cookie('Web3Mastery_SecretRefreshToken', newUserRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none', // Prevent CSRF attacks
          maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return res.status(201).json({
          responseMessage: 'job-category deleted successfully',
          response: {
            deleteResult: deletedResponse,
            deletedJobCategory: existingJobCategory,
            accessToken: newUserAccessToken,
            sessionStatus
          }
        });
      }

      return;
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

export default deletePlatformjobCategory;
