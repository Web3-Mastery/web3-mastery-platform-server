// import { TokenExpiredError } from 'jsonwebtoken';
import { type Request, type Response, type NextFunction } from 'express';
import type { UserSpecs } from '../domains/user/schemas/userSchema.zod.js';
import { findUser } from '../domains/user/lib/user.findUser.service.js';
// import generateTokens from '../utils/generateTokens.js';

type ResponseSpecs = {
  error?: string;
  responseMessage: string;
  response?: {
    adminUser: UserSpecs;
    // token: string;
  };
};

// @ts-ignore
const verifyAdminOrPrivacyMiddleware = async (req: Request<{ userId: string }, ResponseSpecs>, res: Response<ResponseSpecs>, next: NextFunction) => {
  if (req.user) {
    try {
      const { administratorEmail: email } = req.query;
      const { userId } = req.params;
      const adminEmail = email as string;

      const adminUser = await findUser({ email: adminEmail });
      const user = await findUser({ id: userId });

      // if (user || adminUser) {
      if (!user && !adminUser) {
        return res.status(403).json({
          error: 'request rejected',
          responseMessage: `user not found or does not exist`
        });
      }

      if (adminUser?.isAdmin !== true && req.user.userId !== userId) {
        return res.status(403).json({
          error: 'request rejected',
          responseMessage: `Only an admin or the user with this account can perform this action. 
            If admin, pass query(administratorEmail) containing the admin-user's email, if user, 
            pass param(userId) containing the user's platform id respectively.`
        });
        // }
      }

      next();
      // }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        throw new Error(error.message);
      } else {
        console.log(error);
        throw new Error('An error occurred');
      }
    }
  }
};

export default verifyAdminOrPrivacyMiddleware;
